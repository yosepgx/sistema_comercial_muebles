from rest_framework import serializers
from .models import Pedido, PedidoDetalle
class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields= '__all__'

class PedidoDetalleSerializer(serializers.ModelSerializer):
    rnombre = serializers.CharField(source = 'producto.nombre', read_only=True)
    rum = serializers.CharField(source = 'producto.umedida_sunat', read_only=True)
    class Meta:
        model = PedidoDetalle
        fields = ['pedido', 'producto', 'cantidad' ,'precio_unitario' ,
                  'descuento', 'subtotal' ,'nrolinea' ,'activo',
                  'rnombre', 'rum']
        