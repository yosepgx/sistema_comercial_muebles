from django.db import models
from inventario_app.models import Producto
from clientes_app.models import Cliente

#modelos: oportunidad, cotizacion, cotizacionDetalle

class Oportunidad(models.Model):

    EN_NEGOCIACION = 'negociacion'
    GANADO = 'ganado'
    PERDIDO = 'perdido'
    
    ESTADO_OPORTUNIDAD_CHOICES = [
        (EN_NEGOCIACION, 'En Negociación'),
        (GANADO, 'Ganado'),
        (PERDIDO, 'Perdido'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE,null=True)
    #sede = models.ForeignKey(Sede, on_delete=models.CASCADE) #TODO: agregar model Sedez
    fecha_contacto = models.DateField(auto_now_add=True)
    
    estado_oportunidad = models.CharField(
        max_length=20, choices=ESTADO_OPORTUNIDAD_CHOICES, default=EN_NEGOCIACION
    )
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Oportunidad {self.id} - {self.estado_oportunidad}"
    
    def delete(self):
        self.activo = False
        self.save()

    
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
    monto_sin_impuesto = models.DecimalField(max_digits=12, decimal_places=2)
    monto_total = models.DecimalField(max_digits=12, decimal_places=2)
    monto_igv = models.DecimalField(max_digits=12, decimal_places=2)  # En valor no porcentaje
    descuento_adicional = models.DecimalField( max_digits=12, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)
    direccion_entrega = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Cotización {self.id} - {self.estado_cotizacion}"
    
    def delete(self):
        self.activo = False
        self.save()

class CotizacionDetalle(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="cotizaciones_detalle")
    cotizacion = models.ForeignKey(Cotizacion, on_delete=models.CASCADE, related_name="detalles")

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


