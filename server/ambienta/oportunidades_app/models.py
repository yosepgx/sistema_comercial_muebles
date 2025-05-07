from django.db import models
from inventario_app.models import Producto
from clientes_app.models import Contacto

#modelos: oportunidad, cotizacion, cotizacionDetalle

class Oportunidad(models.Model):

    NUEVA = 'nueva'
    EN_NEGOCIACION = 'negociacion'
    GANADO = 'ganado'
    PERDIDO = 'perdido'
    
    ESTADO_OPORTUNIDAD_CHOICES = [
        (NUEVA, 'Nuevo'),
        (EN_NEGOCIACION, 'En Negociación'),
        (GANADO, 'Ganado'),
        (PERDIDO, 'Perdido'),
    ]

    contacto = models.ForeignKey(Contacto, on_delete=models.CASCADE)
    #sede = models.ForeignKey(Sede, on_delete=models.CASCADE) #TODO: agregar model Sede
    valor_neto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_contacto = models.DateField()
    vendedor_asignado = models.IntegerField(null=True, blank=True)  # TODO: Debería ser ForeignKey a un modelo Usuario si existe
    estado_oportunidad = models.CharField(
        max_length=20, choices=ESTADO_OPORTUNIDAD_CHOICES, default=NUEVA
    )
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Oportunidad {self.id} - {self.estado_oportunidad}"
    
class Cotizacion(models.Model):
    PROPUESTA = 'propuesta'
    ACEPTADA = 'aceptada'
    RECHAZADA = 'rechazada'

    ESTADO_COTIZACION_CHOICES = [
        (PROPUESTA, 'Propuesta'),
        (ACEPTADA, 'Aceptada'),
        (RECHAZADA, 'Rechazada'),
    ]

    fecha = models.DateField(auto_now_add=True)
    estado_cotizacion = models.CharField(
        max_length=20, choices=ESTADO_COTIZACION_CHOICES, default=PROPUESTA
    )
    
    oportunidad = models.ForeignKey(Oportunidad, on_delete=models.CASCADE, related_name="cotizaciones")
    validez = models.IntegerField()  # Número de días de validez
    monto_sin_impuesto = models.DecimalField(max_digits=12, decimal_places=2)
    monto_total = models.DecimalField(max_digits=12, decimal_places=2)
    monto_igv = models.DecimalField(max_digits=12, decimal_places=2)  # En valor no porcentaje
    descuento_adicional = models.DecimalField( max_digits=12, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)
    direccion_entrega = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Cotización {self.id} - {self.estado_cotizacion}"
    

class CotizacionDetalle(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="cotizaciones_detalle")
    cotizacion = models.ForeignKey(Cotizacion, on_delete=models.CASCADE, related_name="detalles")

    cantidad = models.PositiveIntegerField(default=1, blank=False)
    descuento = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, blank=False)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    nrolinea = models.PositiveBigIntegerField(blank=False)
    activo  = models.BooleanField(default=True, blank=False)

    def __str__(self):
        return f"Detalle de Pedido {self.pedido.id} - {self.nombre_producto}"


