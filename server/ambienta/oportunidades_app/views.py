from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, viewsets
from .models import Oportunidad,Cotizacion, CotizacionDetalle
from .serializers import OportunidadSerializer, CotizacionSerializer, CotizacionDetalleSerializer
from ventas_app.models import Pedido

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
        
        estado_anterior = instance.estado
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        nuevo_estado = request.data.get('estado_cotizacion', estado_anterior)
        
        if estado_anterior != Cotizacion.ACEPTADA and nuevo_estado == Cotizacion.ACEPTADA:
            # Verificar si ya hay otra cotización aceptada para la misma oportunidad
            oportunidad = instance.oportunidad
            if Cotizacion.objects.filter(oportunidad=oportunidad, estado='aceptada').exclude(id=instance.id).exists():
                raise ValidationError("Ya existe una cotización aceptada para esta oportunidad.")
                return Response({"mensaje": "ya hay una cotizacion aceptada"}, status= status.HTTP_405_METHOD_NOT_ALLOWED)
            
            # 1. Actualizar la oportunidad a estado 'ganada'
            if instance.oportunidad:
                oportunidad = instance.oportunidad
                oportunidad.estado = Oportunidad.GANADO
                oportunidad.save()
                
            # 2. Crear un pedido con la información de la cotización
            self.crear_pedido_desde_cotizacion(instance)
        
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
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
            codigo_tributo = "1000",
            cotizacion=cotizacion,
            moneda = "PEN",
            monto_sin_impuesto = cotizacion.monto_sin_impuesto,
            monto_total=cotizacion.monto_total,
            monto_igv = cotizacion.monto_igv,
            descuento_adicional = cotizacion.descuento_adicional,
            observaciones = cotizacion.observaciones,
            direccion = cotizacion.direccion,
            activo = True
        )
        return pedido

class CotizacionDetalleViewSet(viewsets.ModelViewSet):
    queryset = CotizacionDetalle.objects.all()
    serializer_class = CotizacionDetalleSerializer



