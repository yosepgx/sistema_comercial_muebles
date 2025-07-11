from rest_framework import serializers
from .models import Oportunidad, Cotizacion, CotizacionDetalle
from clientes_app.serializers import ClienteSerializer
#oportunidad -> cotizacion -> cotizacionDetalle
class OportunidadSerializer(serializers.ModelSerializer):
    rcliente = serializers.CharField(source='cliente.documento', read_only = True)
    rvalor_neto = serializers.DecimalField( read_only=True, max_digits=12, decimal_places=2)
    class Meta:
        model = Oportunidad
        fields = '__all__'

#en el codigo de view si puede acceder directamente al modelo oportunidad
#no es necesario agregar campos todos ya estan incluidos
class CotizacionSerializer(serializers.ModelSerializer):
    rcliente = serializers.SerializerMethodField(read_only=True)
    def get_rcliente(self, obj):
        cliente = getattr(obj.oportunidad, 'cliente', None)
        if cliente :
            return getattr(cliente, 'documento', None)
        return None
    
    class Meta:
        model = Cotizacion
        fields = '__all__'

class CotizacionDetalleSerializer(serializers.ModelSerializer):
    rnombre = serializers.CharField(source = 'producto.nombre', read_only=True)
    rum = serializers.CharField(source = 'producto.umedida_sunat', read_only=True)
    rigv = serializers.CharField(source = 'producto.igv', read_only=True)
    class Meta:
        model = CotizacionDetalle
        fields = ['producto', 'cotizacion', 'cantidad' ,'precio_unitario' ,
                  'descuento', 'subtotal' ,'nrolinea' ,'activo',
                  'rnombre', 'rum', 'rigv']