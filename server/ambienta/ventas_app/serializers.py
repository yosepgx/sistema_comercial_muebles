from rest_framework import serializers
from .models import Pedido, PedidoDetalle
class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields= '__all__'

class PedidoDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoDetalle
        fields = '__all__'
        