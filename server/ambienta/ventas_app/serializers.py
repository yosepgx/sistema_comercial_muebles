from rest_framework import serializers
from .models import Pedido, PedidoDetalle
from inventario_app.models import Producto
from decimal import Decimal

class PedidoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Pedido
        fields= '__all__'
        read_only_fields = ['serie', 'correlativo', 'fechaentrega', 'fecha_pago']


class PedidoDetalleSerializer(serializers.ModelSerializer):
    rnombre = serializers.CharField(source = 'producto.nombre', read_only=True)
    rum = serializers.CharField(source = 'producto.umedida_sunat', read_only=True)
    class Meta:
        model = PedidoDetalle
        fields = ['pedido', 'producto', 'cantidad' ,'precio_unitario' ,
                  'descuento', 'subtotal' ,'nrolinea' ,'activo',
                  'rnombre', 'rum']
        

class NotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'
        read_only_fields = ['serie', 'correlativo', 'fechaentrega', 'fecha_pago']

    def validate(self, data):
        tipo_comprobante = data.get("tipo_comprobante")
        pedido_original = data.get("documento_referencia")
        tipo_nota = data.get("tipo_nota")
        #detalles_nota = self.initial_data.get("detalles", []) #para el create espera el

        if not pedido_original:
            raise serializers.ValidationError(code="NOTA_ERR01",detail="Debe especificarse el pedido original.")
        if not tipo_comprobante:
            raise serializers.ValidationError(code="NOTA_ERR02",detail="Debe especificarse el tipo de documento")
        if not tipo_nota:
            raise serializers.ValidationError(code="NOTA_ERR03",detail="Debe especificarse el tipo de nota")
        if pedido_original.estado_pedido == Pedido.ANULADO:
            raise serializers.ValidationError(code="NOTA_ERR04",detail="No se puede emitir una nota para un pedido que ya fue anulado.")
        
        notas_existentes = Pedido.objects.filter(documento_referencia=pedido_original)
        if notas_existentes.exists():
            raise serializers.ValidationError(code="NOTA_ERR05",detail="Ya existe una nota de anulación o devolución total para este pedido.")
        
        return data
    
    #Ya no necesito hacer post con detail sino solo mandarle los detalles en el body del json
    def create(self, validated_data):
        detalles_data = self.initial_data.pop("detalles", [])
        nota = Pedido.objects.create(**validated_data)

        totalizador_con_igv = Decimal("0.00")
        totalizador_sin_igv = Decimal("0.00")
        totalizador_igv = Decimal("0.00")

        for idx, d in enumerate(detalles_data):
            producto_id = d["producto"]
            producto = Producto.objects.get(id=producto_id)  

            subtotal = Decimal(str(d["subtotal"]))
            igv_rate = producto.igv

            divisor = Decimal("1.00") + igv_rate
            sin_igv = subtotal / divisor
            igv = subtotal - sin_igv

            totalizador_con_igv += subtotal
            totalizador_sin_igv += sin_igv
            totalizador_igv += igv

            PedidoDetalle.objects.create(
                pedido=nota,
                producto_id=producto_id,
                cantidad=d["cantidad"],
                precio_unitario=d["precio_unitario"],
                descuento=0,
                subtotal=subtotal,
                nrolinea=idx + 1,
                activo=True
            )

        nota.monto_total = round(totalizador_con_igv, 2)
        nota.monto_sin_impuesto = round(totalizador_sin_igv, 2)
        nota.monto_igv = round(totalizador_igv, 2)
        nota.save()
        return nota