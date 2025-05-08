from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q
from rest_framework import serializers

#categoria -> producto -> precio -> almacen -> inventario
class CategoriaProducto(models.Model):
    descripcion = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.descripcion
    
    def delete(self, *args, **kwargs):
        self.activo = False
        self.save()
        #for producto in self.productos_rel.all():
        #    producto.delete()

class Producto(models.Model):
    UNIDAD_MEDIDA_CHOICES = [
        ('4A', 'BOBINAS'),
        ('BJ', 'BALDE'),
        ('BLL', 'BARRILES'),
        ('BG', 'BOLSA'),
        ('BO', 'BOTELLAS'),
        ('BX', 'CAJA'),
        ('CT', 'CARTONES'),
        ('CMK', 'CENTIMETRO CUADRADO'),
        ('CMQ', 'CENTIMETRO CUBICO'),
        ('CMT', 'CENTIMETRO LINEAL'),
        ('CEN', 'CIENTO DE UNIDADES'),
        ('CY', 'CILINDRO'),
        ('CJ', 'CONOS'),
        ('DZN', 'DOCENA'),
        ('DZP', 'DOCENA POR 10**6'),
        ('BE', 'FARDO'),
        ('GLI', 'GALON INGLES (4,545956L)'),
        ('GRM', 'GRAMO'),
        ('GRO', 'GRUESA'),
        ('HLT', 'HECTOLITRO'),
        ('LEF', 'HOJA'),
        ('SET', 'JUEGO'),
        ('KGM', 'KILOGRAMO'),
        ('KTM', 'KILOMETRO'),
        ('KWH', 'KILOVATIO HORA'),
        ('KT', 'KIT'),
        ('CA', 'LATAS'),
        ('LBR', 'LIBRAS'),
        ('LTR', 'LITRO'),
        ('MWH', 'MEGAWATT HORA'),
        ('MTR', 'METRO'),
        ('MTK', 'METRO CUADRADO'),
        ('MTQ', 'METRO CUBICO'),
        ('MGM', 'MILIGRAMOS'),
        ('MLT', 'MILILITRO'),
        ('MMT', 'MILIMETRO'),
        ('MMK', 'MILIMETRO CUADRADO'),
        ('MMQ', 'MILIMETRO CUBICO'),
        ('MLL', 'MILLARES'),
        ('UM', 'MILLON DE UNIDADES'),
        ('ONZ', 'ONZAS'),
        ('PF', 'PALETAS'),
        ('PK', 'PAQUETE'),
        ('PR', 'PAR'),
        ('FOT', 'PIES'),
        ('FTK', 'PIES CUADRADOS'),
        ('FTQ', 'PIES CUBICOS'),
        ('C62', 'PIEZAS'),
        ('PG', 'PLACAS'),
        ('ST', 'PLIEGO'),
        ('INH', 'PULGADAS'),
        ('RM', 'RESMA'),
        ('DR', 'TAMBOR'),
        ('STN', 'TONELADA CORTA'),
        ('LTN', 'TONELADA LARGA'),
        ('TNE', 'TONELADAS'),
        ('TU', 'TUBOS'),
        ('NIU', 'UNIDAD (BIENES)'),
        ('ZZ', 'UNIDAD (SERVICIOS)'),
        ('GLL', 'US GALON (3,7843 L)'),
        ('YRD', 'YARDA'),
        ('YDK', 'YARDA CUADRADA'),
    ]
    
    umedida_sunat = models.CharField(max_length=5, default='NIU',choices=UNIDAD_MEDIDA_CHOICES)


    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    #material = models.CharField(max_length=255, blank=True, null=True)
    #precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(CategoriaProducto, on_delete=models.CASCADE, related_name="productos_rel")
    #umedida_sunat = models.CharField(max_length=50, default='NIU') #NIU se usa para unidades de bienes
    #codigop_sunat = models.CharField(max_length=50) #opcional
    igv = models.DecimalField(max_digits=5, decimal_places=2, default=0.18) #18% de igv 
    afecto_igv = models.BooleanField(default=True) #sirve por si hay producto sin igv
    codigo_afecion_igv = models.CharField(max_length=4, default='10') #codigo 10 indica que es venta gravada a igv
    es_servicio = models.BooleanField(default=False, null=False)
    activo = models.BooleanField(default=True, null=False)

    def __str__(self):
        return self.nombre
    
    def delete(self, *args, **kwargs):
        self.activo = False
        self.save()
        #los precios relacionados tambien podrian desactivarse
        #el inventario relacionado tambien podria desactivarse
        #for inventario in self.registros_inventario:
        #    inventario.delete()


    @property
    def precio(self):
        precio_activo = self.precio.filter(activo=True).first()
        if precio_activo:
            return precio_activo.valor
        return None

class Precio (models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="precios")
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    fecha_inicio = models.DateTimeField(default=timezone.now,null=False)
    fecha_fin = models.DateTimeField(null=False)
    activo = models.BooleanField(default=True, null=False)

    def __str__(self):
        return f"{self.producto.nombre} - {self.valor} desde {self.fecha_inicio}"
    
    def delete(self, *args, **kwargs):
        self.activo = False
        self.save()

class Almacen(models.Model):
    TIPOALMACEN = 'almacen'
    TIPOTRASTIENDA = 'trastienda'
    TIPO_ALMACEN_CHOICES=[
        (TIPOALMACEN, 'Almacén'),
        (TIPOTRASTIENDA, 'Trastienda')
    ]

    nombre = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, choices=TIPO_ALMACEN_CHOICES)
    #sede_id = models.OneToOneField(Sede) TODO: INGRESAR SEDE
    activo = models.BooleanField(default=True)
    def __str__(self):
        return self.nombre
    
    def delete(self, *args, **kwargs):
        self.activo = False
        self.save()
        #el inventario podria desactivarse

#al activar un producto se tiene que activar sus regitros
class Inventario(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="registros_inventario")
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE)
    cantidad_disponible = models.PositiveIntegerField()
    cantidad_comprometida = models.PositiveIntegerField()
    activo = models.BooleanField(default=True)

    class Meta:
        unique_together = ('producto', 'almacen')  # Evita duplicados del mismo producto en la misma ubicación

    def __str__(self):
        return f"{self.producto} - {self.almacen} ({self.cantidad_disponible})"
    
    def delete(self, *args, **kwargs):
        self.activo = False
        self.save()

