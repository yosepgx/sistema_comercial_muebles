from django.db import models
from oportunidades_app.models import Cotizacion
from inventario_app.models import Producto
class Pedido(models.Model):
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
    direccion = models.CharField(max_length=255)

    cotizacion = models.OneToOneField(Cotizacion, on_delete=models.PROTECT)

    moneda = models.CharField(max_length=5, default="PEN")  # Sol peruano
    RUC_emisor = models.CharField(max_length=11)  # 11 dígitos
    cliente = models.CharField(max_length=255, default='cli') #razon o nombre completo
    DOC_cliente = models.CharField(max_length=20)  # DNI/RUC u otro documento

    monto_sin_impuesto = models.DecimalField(max_digits=10, decimal_places=2)#valor de venta
    forma_pago = models.CharField(max_length=50, default="contado")

    estado_pedido = models.CharField(max_length=15, choices=ESTADOS_PEDIDO, default=PENDIENTE)
    
    fecha_pago = models.DateField(null=True, blank=True)

    monto_total = models.DecimalField(max_digits=10, decimal_places=2)#incluye IGV
    monto_igv = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    codigo_tributo = models.CharField(max_length=10, default="1000")
    descuento_adicional = models.DecimalField(max_digits=8, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)

    activo = models.BooleanField(default=True)
    def __str__(self):
        return f"Pedido {self.id} - {self.estado_pedido}"


class PedidoDetalle(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="pedidos_detalle")(blank=False)
    cantidad = models.PositiveIntegerField(default=1, blank=False)
    descuento = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, blank=False)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    nrolinea = models.PositiveBigIntegerField(blank=False)
    activo  = models.BooleanField(default=True, blank=False)

    def __str__(self):
        return f"Detalle de Pedido {self.pedido.id} - {self.nombre_producto}"



