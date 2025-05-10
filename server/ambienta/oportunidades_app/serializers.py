from rest_framework import serializers
from .models import Oportunidad, Cotizacion, CotizacionDetalle
#oportunidad -> cotizacion -> cotizacionDetalle
class OportunidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Oportunidad
        fields = '__all__'

#en el codigo de view si puede acceder directamente al modelo oportunidad
class CotizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cotizacion
        fields = '__all__'

class CotizacionDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CotizacionDetalle
        fields = '__all__'