from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator

#TODO: configurar validadores para cada clase

# class CategoriaCliente(models.Model):
#     descripcion = models.CharField(max_length=255, unique=True)
#     activo = models.BooleanField(default=True)

#     def __str__(self):
#         return self.descripcion
    
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
    tipo_interes = models.CharField(max_length=10, choices=TIPO_INTERES_CHOICES)
    fecha_conversion = models.DateField(blank=True, null=True)  # Puede ser NULL si aún no se convierte
    naturaleza = models.CharField(max_length=10, choices=NATURALEZA_CHOICES)
    #categoria = models.ForeignKey(CategoriaCliente, on_delete=models.SET_NULL, null=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_interes_display()})"
    
    def delete(self):
        self.activo = False
        self.save()


class DocumentoID(models.Model):
    TIPODNI = 'DNI'
    TIPORUC = 'RUC'
    TIPOCE = 'CE'

    TIPO_DOCUMENTO_CHOICES = [
        (TIPODNI, 'DNI'),
        (TIPORUC, 'RUC'),
        (TIPOCE, 'CE'),
    ]

    #tipo = models.CharField(max_length=3, choices=TIPO_DOCUMENTO_CHOICES, blank=True, null=True)
    cod_dni = models.CharField(max_length=8, blank=True, null=True)
    cod_ruc = models.CharField(max_length=11, blank=True, null=True)
    #cod_ce = models.CharField(max_length=9, blank=True, null=True)
    contacto = models.OneToOneField(Contacto, on_delete=models.CASCADE, related_name='documento')
    activo = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.tipo}: {self.contacto.nombre}"
    
    def delete(self):
        self.activo = False
        self.save()

