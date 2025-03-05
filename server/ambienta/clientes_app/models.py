from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator

#TODO: configurar validadores para cada clase

class Empresa(models.Model):
    razon_social = models.CharField(max_length=255, unique=True)
    RUC = models.CharField(max_length=11, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(unique=True)
    direccion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.razon_social



class CategoriaCliente(models.Model):
    descripcion = models.CharField(max_length=255, unique=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.descripcion
    
class Contacto(models.Model):
    TIPOCLIENTE = 'cliente'
    TIPOLEAD = 'lead'

    TIPO_INTERES_CHOICES = [
        (TIPOCLIENTE, 'Cliente'),
        (TIPOLEAD, 'Lead'),
    ]

    TIPONATURAL = 'Natural'
    TIPOEMPRESA = 'Empresa'

    NATURALEZA_CHOICES = [
        (TIPONATURAL, 'Natural'),
        (TIPOEMPRESA, 'Empresa'),
    ]

    nombre = models.CharField(max_length=255)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion_entrega = models.TextField(blank=True, null=True)
    tipo_interes = models.CharField(max_length=10, choices=TIPO_INTERES_CHOICES)
    fecha_conversion = models.DateField(blank=True, null=True)  # Puede ser NULL si aún no se convierte
    naturaleza = models.CharField(max_length=10, choices=NATURALEZA_CHOICES)
    empresa = models.OneToOneField(Empresa, on_delete=models.SET_NULL, null=True, blank=True)
    categoria = models.ForeignKey(CategoriaCliente, on_delete=models.SET_NULL, null=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_interes_display()})"


class DocumentoID(models.Model):
    TIPODNI = 'DNI'
    TIPORUC = 'RUC'
    TIPOCE = 'CE'

    TIPO_DOCUMENTO_CHOICES = [
        (TIPODNI, 'DNI'),
        (TIPORUC, 'RUC'),
        (TIPOCE, 'CE'),
    ]

    tipo = models.CharField(max_length=3, choices=TIPO_DOCUMENTO_CHOICES)
    cod_dni = models.CharField(max_length=8, blank=True, null=True)
    cod_ruc = models.CharField(max_length=11, blank=True, null=True)
    cod_ce = models.CharField(max_length=9, blank=True, null=True)
    contacto = models.ForeignKey(Contacto, on_delete=models.CASCADE, related_name='documentos')
    activo = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.tipo}: {self.contacto.nombre}"

