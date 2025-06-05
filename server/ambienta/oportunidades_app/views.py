from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from .models import Oportunidad,Cotizacion, CotizacionDetalle
from .serializers import OportunidadSerializer, CotizacionSerializer, CotizacionDetalleSerializer
from ventas_app.models import Pedido, PedidoDetalle
from django.db import transaction
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
import tempfile
from ventas_app.services import CorrelativoService
from clientes_app.models import Cliente

#oportunidad -> cotizacion -> cotizacionDetalle -> pedido -> pedidoDetalle
#TODO: agregar vigencia a las oportunidades

#si despues de determinado tiempo (vigencia) el cliente no regresa se pasa a perdido
#tambien el vendedor lo puede marcar como perdido
class OportunidadViewSet(viewsets.ModelViewSet):
    queryset = Oportunidad.objects.all().order_by('-id')
    serializer_class = OportunidadSerializer


class CotizacionViewSet(viewsets.ModelViewSet):
    queryset = Cotizacion.objects.all().order_by('-id')
    serializer_class = CotizacionSerializer

    def update(self, request, *args, **kwargs):
        """
        Sobreescribe el método update para manejar la lógica cuando una cotización 
        cambia a estado 'aceptada'
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        estado_anterior = instance.estado_cotizacion
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        nuevo_estado = request.data.get('estado_cotizacion', estado_anterior)
        
        with transaction.atomic():
            if estado_anterior != Cotizacion.ACEPTADA and nuevo_estado == Cotizacion.ACEPTADA:
#               Verificar si ya hay otra cotización aceptada para la misma oportunidad
                oportunidad = instance.oportunidad
                if Cotizacion.objects.filter(oportunidad=oportunidad, estado_cotizacion='aceptada').exclude(id=instance.id).exists():
                    raise ValidationError({
                        "codigo": "COTIZACION_DUPLICADA",
                        "detalle": "Ya existe una cotización aceptada para esta oportunidad."
                    })
                
#               Validar stock suficiente
                for detalle in instance.detalles.all():
                    stock_disponible = detalle.producto.stock
                    if detalle.cantidad > stock_disponible:
                        raise ValidationError({
                            "codigo": "STOCK_INSUFICIENTE",
                            "detalle": f"No hay stock suficiente para el producto '{detalle.producto.nombre}'. "
                                       f"Requiere {detalle.cantidad}, disponible {stock_disponible}."
                        })
                    
#               Validar cliente y sede 
                cliente = instance.oportunidad.cliente
                if not cliente:
                    raise ValidationError({
                        "codigo": "SIN_CLIENTE",
                        "detalle": "La cotización no tiene un cliente asociado."
                        })

                sede = instance.oportunidad.sede
                if not sede or not sede.id:
                    raise ValidationError({
                        "codigo": "SIN_SEDE",
                        "detalle": "La cotización no tiene una sede asociada."
                        })

#               1. Actualizar la oportunidad a estado 'ganada'
                if instance.oportunidad:
                    oportunidad = instance.oportunidad
                    oportunidad.estado_oportunidad = Oportunidad.GANADO
                    oportunidad.save()
                    
#               2. Crear un pedido con la información de la cotización
                self.crear_pedido_desde_cotizacion(instance, cliente, sede)
            
            self.perform_update(serializer)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def crear_pedido_desde_cotizacion(self, cotizacion : Cotizacion, cliente, sede):
        """
        Crea un pedido a partir de una cotización aceptada
        """
        if cliente.tipo_documento == Cliente.TIPODNI:
                    tipo_comprobante = Pedido.TIPOBOLETA
        else:
            tipo_comprobante = Pedido.TIPOFACTURA
        
        # Darle una Serie y un correlativo (solo facturas y boletas, la NC y ND se trabajan con las anulaciones)
        resultado = CorrelativoService.guardar_siguiente_correlativo(sede_id=sede.id,tipo_documento=tipo_comprobante)
        
        # Creamos el pedido con la información de la cotización
        pedido = Pedido.objects.create(
            #fecha = now_add
            fechaentrega = None,
            fecha_pago = None,
            serie = resultado['serie'],
            correlativo = resultado['correlativo'],
            tipo_comprobante = tipo_comprobante, #boleta/factura
            estado_pedido=Pedido.PENDIENTE,
            codigo_tipo_tributo = "1000",
            cotizacion=cotizacion,
            moneda = "PEN",
            monto_sin_impuesto = cotizacion.monto_sin_impuesto,
            monto_total=cotizacion.monto_total,
            monto_igv = cotizacion.monto_igv,
            descuento_adicional = cotizacion.descuento_adicional,
            observaciones = cotizacion.observaciones,
            direccion = cotizacion.direccion_entrega,
            activo = True
        )

        
        

        # Copiar cada línea de detalle de la cotización al pedido
        for detalle in cotizacion.detalles.all():
            PedidoDetalle.objects.create(
            pedido=pedido,
            producto=detalle.producto,
            cantidad=detalle.cantidad,
            precio_unitario = detalle.precio_unitario,
            descuento=detalle.descuento,
            subtotal=detalle.subtotal,
            nrolinea=detalle.nrolinea,
            activo = detalle.activo,
        )
        

class CotizacionDetalleViewSet(viewsets.ModelViewSet):
    queryset = CotizacionDetalle.objects.all() 
    serializer_class = CotizacionDetalleSerializer

    def get_queryset(self):
        cotizacion_id = self.request.query_params.get('cotizacion_id')
        if cotizacion_id:
            return CotizacionDetalle.objects.filter(cotizacion_id=cotizacion_id)
        return super().get_queryset()


class GenerarPDFCotizacionView(APIView):

    def get(self, request, cotizacion_id):
        try:
            cotizacion = Cotizacion.objects.prefetch_related('detalles__producto').get(id=cotizacion_id)
            #cotizacion = Cotizacion.objects.select_related('oportunidad__cliente').prefetch_related('detalles__producto').get(id=cotizacion_id)
        except Cotizacion.DoesNotExist:
            return HttpResponse("Cotización no encontrada", status=404)

        html_string = render_to_string("cotizaciones/pdf_cotizacion.html", {
            "cotizacion": cotizacion,
            # "cliente": cotizacion.oportunidad.cliente,
            "detalles": cotizacion.detalles.filter(activo=True)
        })

        pdf_bytes = HTML(string=html_string).write_pdf()
        
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
    #    response['Content-Disposition'] = f'inline; filename="Cotizacion_{cotizacion.id}.pdf"'
        response['Content-Disposition'] = f'attachment; filename="Cotizacion_{cotizacion.id}.pdf"'
        return response