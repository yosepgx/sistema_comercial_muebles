from django.db import models
from oportunidades_app.models import Cotizacion
from inventario_app.models import Producto
from ajustes_app.models import Sede
class Pedido(models.Model):

    TIPOFACTURA = 'factura'
    TIPOBOLETA = 'boleta'
    TIPONCBOLETA = 'nota_credito_boleta'
    TIPONDBOLETA = 'nota_debito_boleta'
    TIPONCFACTURA = 'nota_credito_factura'
    TIPONDFACTURA = 'nota_debito_factura'
    TIPO_COMPROBANTE_CHOICES = [
        (TIPOFACTURA, 'factura'),
        (TIPOBOLETA, 'boleta'),
        (TIPONCBOLETA, 'nota_credito_boleta'),
        (TIPONDBOLETA, 'nota_debito_boleta'),
        (TIPONCFACTURA, 'nota_credito_factura'),
        (TIPONDFACTURA, 'nota_debito_factura'),
    ]

    PENDIENTE = 'pendiente'
    PAGADO = 'pagado'
    DESPACHADO ='despachado'
    ANULADO = 'anulado'
    ESTADOS_PEDIDO = [
        (PENDIENTE, 'Pendiente'),
        (PAGADO, 'Pagado'),
        (DESPACHADO, 'Despachado'),
        (ANULADO, 'Anulado'),
    ]

    fecha = models.DateTimeField(auto_now_add=True) #siempre sera la fecha de creacion
    fechaentrega = models.DateField(null=True, blank=True)
    fecha_pago = models.DateField(null=True, blank=True)
    serie = models.CharField(max_length=15, null=False, blank=False)
    correlativo = models.CharField(max_length=15, null=False, blank=False)
    tipo_comprobante = models.CharField(max_length=50, choices=TIPO_COMPROBANTE_CHOICES)
    estado_pedido = models.CharField(max_length=15, choices=ESTADOS_PEDIDO, default=PENDIENTE)
    codigo_tipo_tributo = models.CharField(max_length=10, default="1000")    
    cotizacion = models.OneToOneField(Cotizacion, on_delete=models.PROTECT, null=True)
    moneda = models.CharField(max_length=5, default="PEN")  # Sol peruano

    monto_sin_impuesto = models.DecimalField(max_digits=10, decimal_places=2)#valor de venta
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)#incluye IGV
    monto_igv = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    descuento_adicional = models.DecimalField(max_digits=8, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)
    direccion = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    documento_referencia = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notas_asociadas',
        help_text="Pedido original al que se asocia esta nota de crédito o débito"
    )
    
    def __str__(self):
        return f"Pedido {self.id} - {self.estado_pedido}"
    
    def delete(self):
        self.activo = False
        self.save()


class PedidoDetalle(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="pedidos_detalle", blank=False)
    cantidad = models.PositiveIntegerField(default=1, blank=False)
    precio_unitario = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, blank=False)
    descuento = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, blank=False)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    nrolinea = models.PositiveBigIntegerField(blank=False)
    activo  = models.BooleanField(default=True, blank=False)

    def __str__(self):
        return f"Detalle de Pedido {self.pedido.id} - {self.nombre_producto}"

    def delete(self):
        self.activo = False
        self.save()

class SerieCorrelativo(models.Model):
    TIPOFACTURA = 'factura'
    TIPOBOLETA = 'boleta'
    TIPONCBOLETA = 'nota_credito_boleta'
    TIPONDBOLETA = 'nota_debito_boleta'
    TIPONCFACTURA = 'nota_credito_factura'
    TIPONDFACTURA = 'nota_debito_factura'
    TIPO_COMPROBANTE_CHOICES = [
        (TIPOFACTURA, 'factura'),
        (TIPOBOLETA, 'boleta'),
        (TIPONCBOLETA, 'nota_credito_boleta'),
        (TIPONDBOLETA, 'nota_debito_boleta'),
        (TIPONCFACTURA, 'nota_credito_factura'),
        (TIPONDFACTURA, 'nota_debito_factura'),
    ]
    sede = models.ForeignKey(Sede, on_delete=models.CASCADE, related_name= "serie_correlativos")
    tipo_comprobante = models.CharField(max_length=50, choices=TIPO_COMPROBANTE_CHOICES)
    serie = models.CharField(max_length=10)
    ultimo_correlativo = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)