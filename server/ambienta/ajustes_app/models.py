from django.db import models

class Dgeneral (models.Model):
    codigo_RUC  = models.CharField(max_length=11)
    razon_social = models.CharField(max_length=250)
    nombre_comercial = models.CharField(max_length=250)
    direccion_fiscal = models.CharField(max_length=350)
    margen_general = models.DecimalField(max_digits = 10, decimal_places=2)
    activo = models.BooleanField(default=True)

class Sede(models.Model):
    nombre = models.CharField(max_length=255)
    dgeneral = models.ForeignKey(Dgeneral, on_delete=models.CASCADE, related_name = "sedes")
    activo = models.BooleanField(default=True)

