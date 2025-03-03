from django.db import models
from inventario_app.models import Producto
from clientes_app.models import Contacto
class Oportunidad(models.Model):

    NUEVO = 'nuevo'
    EN_NEGOCIACION = 'negociacion'
    GANADO = 'ganado'
    PERDIDO = 'perdido'
    
    ESTADO_OPORTUNIDAD_CHOICES = [
        (NUEVO, 'Nuevo'),
        (EN_NEGOCIACION, 'En Negociación'),
        (GANADO, 'Ganado'),
        (PERDIDO, 'Perdido'),
    ]

    contacto = models.OneToOneField(Contacto, on_delete=models.CASCADE) 
    resultado = models.TextField(blank=True, null=True)
    valor_neto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_contacto = models.DateField()
    vendedor_asignado = models.IntegerField(null=True)  # TODO: Debería ser ForeignKey a un modelo Usuario si existe
    estado_oportunidad = models.CharField(
        max_length=20, choices=ESTADO_OPORTUNIDAD_CHOICES, default=NUEVO
    )
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Oportunidad {self.id} - {self.estado_oportunidad}"
    
class Cotizacion(models.Model):
    NUEVA = 'nueva'
    PROPUESTA = 'propuesta'
    ACEPTADA = 'aceptada'
    RECHAZADA = 'rechazada'

    ESTADO_COTIZACION_CHOICES = [
        (NUEVA, 'Nueva'),
        (PROPUESTA, 'Propuesta'),
        (ACEPTADA, 'Aceptada'),
        (RECHAZADA, 'Rechazada'),
    ]

    fecha = models.DateField(auto_now_add=True)
    estado_cotizacion = models.CharField(
        max_length=20, choices=ESTADO_COTIZACION_CHOICES, default=NUEVA
    )
    
    oportunidad = models.ForeignKey(Oportunidad, on_delete=models.CASCADE, related_name="cotizaciones")
    validez = models.IntegerField()  # Número de días de validez
    monto_sin_impuesto = models.DecimalField(max_digits=12, decimal_places=2)
    monto_total = models.DecimalField(max_digits=12, decimal_places=2)
    IGV = models.DecimalField(max_digits=12, decimal_places=2)  # En valor no descuento
    observaciones = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Cotización {self.id} - {self.estado_cotizacion}"
    

class CotizacionDetalle(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="cotizaciones_detalle")
    cotizacion = models.ForeignKey(Cotizacion, on_delete=models.CASCADE, related_name="detalles")

    nombre_producto = models.CharField(max_length=255, blank=False)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2 , blank=False)
    cantidad = models.PositiveIntegerField(default=1, blank=False)
    descuento = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, blank=False)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    nrolinea = models.PositiveBigIntegerField(blank=False)
    activo  = models.BooleanField(default=True, blank=False)

    def __str__(self):
        return f"Detalle de Pedido {self.pedido.id} - {self.nombre_producto}"


