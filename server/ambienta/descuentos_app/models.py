from django.db import models
from inventario_app.models import Producto
class ReglaDescuento(models.Model):
    TIPO_DESCUENTO = [
        ('porcentaje', 'Porcentaje'),
        ('monto_fijo', 'Monto Fijo'),
        ('cantidad', 'Por Cantidad'),
    ]
    
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="reglas")
    fecha_inicio = models.DateTimeField(null=False)
    fecha_fin = models.DateTimeField(null=False)
    monto_fijo = models.DecimalField(default=0, max_digits=10, decimal_places=2, null=True)
    porcentaje = models.DecimalField(default=0, max_digits=10, decimal_places=2, null=True)
    cantidad_pagada = models.IntegerField(default=0, null=False)
    cantidad_libre = models.IntegerField(default=0, null=False)
    cantidad_libre_maxima = models.IntegerField(default=0, null=False)
    tipo_descuento = models.CharField(max_length=30,choices=TIPO_DESCUENTO, null=False)
    activo = models.BooleanField(default=True)