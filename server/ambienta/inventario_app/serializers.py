from rest_framework import serializers
from inventario_app.models import Almacen,CategoriaProducto,Inventario,Producto

class AlmacenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Almacen
        fields = '__all__'

class CategoriaProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaProducto
        fields = '__all__'

class InventarioSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source= 'producto.nombre', read_only = True)
    class Meta:
        model = Inventario
        fields = ['id','producto','almacen', 'cantidad_disponible', 'cantidad_comprometida', 'nombre_producto' ]

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'
