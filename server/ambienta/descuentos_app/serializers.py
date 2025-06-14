# serializers.py
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import ReglaDescuento
from inventario_app.models import Producto
from django.utils import timezone


class ReglaDescuentoSerializer(serializers.ModelSerializer):
    rproducto_info = serializers.CharField(source='producto.nombre', read_only=True)
    rporcentaje_descuento = serializers.SerializerMethodField(read_only = True)
    restado = serializers.SerializerMethodField(read_only= True)
    
    class Meta:
        model = ReglaDescuento
        fields = [
            'id', 'producto', 'rproducto_info',
            'fecha_inicio', 'fecha_fin', 'monto_fijo', 'porcentaje',
            'cantidad_pagada', 'cantidad_libre', 'cantidad_libre_maxima',
            'tipo_descuento','activo', 'rporcentaje_descuento', 'restado'
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
        ahora = timezone.now()
        
        if not obj.activo:
            return "Inactivo"
        elif ahora < obj.fecha_inicio:
            return "Programado"
        elif ahora > obj.fecha_fin:
            return "Vencido"
        else:
            return "Activo"
