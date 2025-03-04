from django.db import models
from oportunidades_app.models import Cotizacion
class Pedido(models.Model):
    ESTADOS_PEDIDO = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('despachado', 'Despachado'),
        ('anulado', 'Anulado'),
    ]

    fecha = models.DateTimeField(auto_now_add=True)
    fechaentrega = models.DateField(null=True, blank=True)
    direccion = models.CharField(max_length=255)

    cotizacion = models.OneToOneField(Cotizacion, on_delete=models.PROTECT)

    moneda = models.CharField(max_length=5, default="PEN")  # Sol peruano
    RUC_emisor = models.CharField(max_length=11)  # 11 dígitos
    cliente = models.CharField(max_length=255, default='cli') #razon o nombre completo
    DOC_cliente = models.CharField(max_length=20)  # DNI/RUC u otro documento

    monto_sin_impuesto = models.DecimalField(max_digits=10, decimal_places=2)#valor de venta
    forma_pago = models.CharField(max_length=50, default="contado")

    estado_pedido = models.CharField(max_length=15, choices=ESTADOS_PEDIDO, default="pendiente")
    
    fecha_pago = models.DateField(null=True, blank=True)
    fecha_despacho = models.DateField(null=True, blank=True)

    monto_total = models.DecimalField(max_digits=10, decimal_places=2)#incluye IGV
    IGV = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    codigo_tributo = models.CharField(max_length=10, default="1000")
    descuento_adicional = models.DecimalField(max_digits=8, decimal_places=2)

    activo = models.BooleanField(default=True)
    def __str__(self):
        return f"Pedido {self.id} - {self.estado_pedido}"


class PedidoDetalle(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")

    nombre_producto = models.CharField(max_length=255, blank=False)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2 , blank=False)
    cantidad = models.PositiveIntegerField(default=1, blank=False)
    descuento = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, blank=False)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    nrolinea = models.PositiveBigIntegerField(blank=False)
    activo  = models.BooleanField(default=True, blank=False)

    def __str__(self):
        return f"Detalle de Pedido {self.pedido.id} - {self.nombre_producto}"



