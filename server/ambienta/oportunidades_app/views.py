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

#oportunidad -> cotizacion -> cotizacionDetalle -> pedido -> pedidoDetalle
#TODO: agregar vigencia a las oportunidades

#si despues de determinado tiempo (vigencia) el cliente no regresa se pasa a perdido
#tambien el vendedor lo puede marcar como perdido
class OportunidadViewSet(viewsets.ModelViewSet):
    queryset = Oportunidad.objects.all()
    serializer_class = OportunidadSerializer


class CotizacionViewSet(viewsets.ModelViewSet):
    queryset = Cotizacion.objects.all()
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
                
#               1. Actualizar la oportunidad a estado 'ganada'
                if instance.oportunidad:
                    oportunidad = instance.oportunidad
                    oportunidad.estado_oportunidad = Oportunidad.GANADO
                    oportunidad.save()
                    
#               2. Crear un pedido con la información de la cotización
                self.crear_pedido_desde_cotizacion(instance)
            
            self.perform_update(serializer)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def crear_pedido_desde_cotizacion(self, cotizacion):
        """
        Crea un pedido a partir de una cotización aceptada
        """
        # Creamos el pedido con la información de la cotización
        pedido = Pedido.objects.create(
            #fecha = now_add
            fechaentrega = None,
            fecha_pago = None,
            estado_pedido='por_validar',
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
        
        return Response({"pedido": pedido}, status=status.HTTP_200_OK)

class CotizacionDetalleViewSet(viewsets.ModelViewSet):
    queryset = CotizacionDetalle.objects.all() 
    serializer_class = CotizacionDetalleSerializer

    def get_queryset(self):
        cotizacion_id = self.request.query_params.get('cotizacion_id')
        if cotizacion_id:
            return CotizacionDetalle.objects.filter(cotizacion_id=cotizacion_id)
        return super().get_queryset()


def generar_pdf_cotizacion(request, cotizacion_id):
    #cotizacion = Cotizacion.objects.select_related('oportunidad__cliente').prefetch_related('detalles__producto').get(id=cotizacion_id)
    cotizacion = Cotizacion.objects.prefetch_related('detalles__producto').get(id=cotizacion_id)

    html_string = render_to_string("cotizaciones/pdf_cotizacion.html", {
        "cotizacion": cotizacion,
        # "cliente": cotizacion.oportunidad.cliente,
        "detalles": cotizacion.detalles.all()
    })

    with tempfile.NamedTemporaryFile(delete=True, suffix=".pdf") as output:
        HTML(string=html_string).write_pdf(output.name)
        output.seek(0)
        response = HttpResponse(output.read(), content_type="application/pdf")
        response['Content-Disposition'] = f'attachment; filename="Cotizacion_{cotizacion.id}.pdf"'
        return response