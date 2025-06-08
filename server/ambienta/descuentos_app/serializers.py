# serializers.py
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import ReglaDescuento
from inventario_app.models import Producto

class ProductoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'codigo', 'nombre']

class ReglaDescuentoSerializer(serializers.ModelSerializer):
    rproducto_info = ProductoSimpleSerializer(source='producto', read_only=True)
    rporcentaje_descuento = serializers.SerializerMethodField(read_only = True)
    restado = serializers.SerializerMethodField(read_only= True)
    
    class Meta:
        model = ReglaDescuento
        fields = [
            'id', 'producto', 'rproducto_info',
            'fecha_inicio', 'fecha_fin', 'monto_fijo', 'porcentaje',
            'cantidad_pagada', 'cantidad_libre', 'cantidad_libre_maxima',
            'activo', 'rporcentaje_descuento', 'restado'
        ]

    def get_rporcentaje_descuento(self, obj):
        """Retorna el descuento formateado"""
        if obj.porcentaje:
            return f"{obj.porcentaje}%"
        elif obj.monto_fijo:
            return f"${obj.monto_fijo}"
        return "0.00%"

    def get_restado(self, obj):
        """Retorna el estado actual de la regla"""
        from django.utils import timezone
        hoy = timezone.now().date()
        
        if not obj.activo:
            return "Inactivo"
        elif hoy < obj.fecha_inicio:
            return "Programado"
        elif hoy > obj.fecha_fin:
            return "Vencido"
        else:
            return "Activo"

    def validate(self, data):
        """Validaciones personalizadas"""
        errors = {}
        
        # Validar fechas
        if data.get('fecha_inicio') and data.get('fecha_fin'):
            if data['fecha_inicio'] >= data['fecha_fin']:
                errors['fecha_fin'] = "La fecha fin debe ser posterior a la fecha inicio"
        
        # Validar que tenga al menos un tipo de descuento
        if not data.get('porcentaje') and not data.get('monto_fijo'):
            if not (data.get('cantidad_pagada') and data.get('cantidad_libre')):
                errors['non_field_errors'] = ["Debe especificar al menos un tipo de descuento"]
        
        # Validar porcentaje
        if data.get('porcentaje') and (data['porcentaje'] < 0 or data['porcentaje'] > 100):
            errors['porcentaje'] = "El porcentaje debe estar entre 0 y 100"
        
        # Validar monto fijo
        if data.get('monto_fijo') and data['monto_fijo'] < 0:
            errors['monto_fijo'] = "El monto fijo no puede ser negativo"
        
        # Validar cantidades
        if data.get('cantidad_pagada', 0) < 0:
            errors['cantidad_pagada'] = "La cantidad pagada no puede ser negativa"
        
        if data.get('cantidad_libre', 0) < 0:
            errors['cantidad_libre'] = "La cantidad libre no puede ser negativa"
        
        if data.get('cantidad_libre_maxima', 0) < 0:
            errors['cantidad_libre_maxima'] = "La cantidad libre máxima no puede ser negativa"
        
        # Validar duplicados
        producto = data.get('producto')
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        
        if producto and fecha_inicio and fecha_fin:
            query = ReglaDescuento.objects.filter(
                producto=producto,
                fecha_inicio__range=[fecha_inicio, fecha_fin],
                fecha_fin__range = [fecha_inicio, fecha_fin]
            )
            
            # Si estamos editando, excluir el registro actual
            if self.instance:
                query = query.exclude(pk=self.instance.pk)
                
            if query.exists():
                errors['non_field_errors'] = ["Ya existe una regla para este producto en las fechas seleccionadas"]
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data