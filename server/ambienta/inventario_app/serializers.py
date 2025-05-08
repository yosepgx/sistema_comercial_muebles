from rest_framework import serializers
from inventario_app.models import Almacen,CategoriaProducto,Inventario,Producto, Precio

class AlmacenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Almacen
        fields = '__all__'

class PrecioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Precio
        fields ='__all__'


class CategoriaProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaProducto
        fields = '__all__'

class InventarioSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source= 'producto.nombre', read_only = True)
    class Meta:
        model = Inventario
        fields = ['id','producto','almacen', 'cantidad_disponible', 'cantidad_comprometida', 'nombre_producto' ]

#cada vez que traemos un precio debe de ser el ultimo que esta activo
#cada vez que guardamos un precio este desactiva el anterior fija el inicio como ahora, el final como el por defecto o el indicado
class ProductoSerializer(serializers.ModelSerializer):
    rprecio_actual = serializers.FloatField(source= 'producto.precio', read_only = True)
    rhistorial_precio = PrecioSerializer (source = "precios", many=True, read_only = True)
    rcategoria_producto= CategoriaProductoSerializer ( source = "categoria", read_only = True)
    class Meta:
        model = Producto
        fields = ['id', 'nombre','umedida_sunat', 'descripcion', 'categoria', 'igv', 
                  'afecto_igv', 'codigo_afecion_igv', 'es_servicio', 'activo', 
                  'rprecio_actual', 'rhistorial_precio', 'rcategoria_producto' ]
