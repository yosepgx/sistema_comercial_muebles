from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from decimal import Decimal
from .models import ReglaDescuento

# views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import ReglaDescuento
from .serializers import ReglaDescuentoSerializer, ValidationError

@api_view(['POST'])
def calcular_descuentos_linea(request):
    """
    Calcula descuentos automáticos para una línea de cotización
    """
    data = request.data
    producto_id = data.get('producto_id')
    cantidad = data.get('cantidad', 1)
    precio_unitario = Decimal(str(data.get('precio_unitario', 0)))
    
    try:
        # Obtener reglas activas para el producto en fecha actual
        reglas_activas = ReglaDescuento.objects.filter(
            producto_id=producto_id,
            activo=True,
            fecha_inicio__lte=timezone.now().date(),
            fecha_fin__gte=timezone.now().date()
        ).order_by('-fecha_inicio')  # Más reciente primero
        
        descuento_total = Decimal('0.00')
        descuentos_aplicados = []
        
        for regla in reglas_activas:
            descuento_regla = calcular_descuento_por_regla(regla, cantidad, precio_unitario)
            if descuento_regla > 0:
                descuento_total += descuento_regla
                descuentos_aplicados.append({
                    'tipo': regla.tipo_descuento,
                    'monto': float(descuento_regla),
                    'descripcion': generar_descripcion_descuento(regla)
                })
        
        # Calcular subtotal
        subtotal_sin_descuento = precio_unitario * cantidad
        subtotal_con_descuento = subtotal_sin_descuento - descuento_total
        
        return Response({
            'descuento_total': float(descuento_total),
            'subtotal': float(subtotal_con_descuento),
            'descuentos_aplicados': descuentos_aplicados,
            'precio_unitario': float(precio_unitario),
            'cantidad': cantidad
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)

def calcular_descuento_por_regla(regla, cantidad, precio_unitario):
    """Calcula descuento según el tipo de regla"""
    if regla.tipo_descuento == 'porcentaje':
        return (precio_unitario * cantidad) * (regla.porcentaje / 100)
    
    elif regla.tipo_descuento == 'monto_fijo':
        return regla.monto_fijo
    
    elif regla.tipo_descuento == 'cantidad':
        # Ejemplo: Por cada 3 que compres, 1 gratis
        if cantidad >= regla.cantidad_pagada:
            productos_gratis = min(
                cantidad // regla.cantidad_pagada, 
                regla.cantidad_libre_maxima
            )
            return precio_unitario * productos_gratis
    
    return Decimal('0.00')

def generar_descripcion_descuento(regla):
    """Genera descripción legible del descuento"""
    if regla.tipo_descuento == 'porcentaje':
        return f"Descuento {regla.porcentaje}%"
    elif regla.tipo_descuento == 'monto_fijo':
        return f"Descuento fijo S/ {regla.monto_fijo}"
    elif regla.tipo_descuento == 'cantidad':
        return f"Por cada {regla.cantidad_pagada}, {regla.cantidad_libre} gratis"
    return "Descuento aplicado"


class ReglaDescuentoViewSet(viewsets.ModelViewSet):
    queryset = ReglaDescuento.objects.select_related('producto').all()
    serializer_class = ReglaDescuentoSerializer
    

    def create(self, request, *args, **kwargs):
        """Crear nueva regla con manejo de errores"""
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                regla = serializer.save()
                
                return Response({
                    'success': True,
                    'message': 'Regla de descuento creada exitosamente',
                    'data': ReglaDescuentoSerializer(regla).data
                }, status=status.HTTP_201_CREATED)
                
        except ValidationError as e:
            return Response({
                'success': False,
                'message': 'Error de validación',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error inesperado: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """Actualizar regla existente"""
        try:
            with transaction.atomic():
                partial = kwargs.pop('partial', False)
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                regla = serializer.save()
                
                return Response({
                    'success': True,
                    'message': 'Regla actualizada exitosamente',
                    'data': ReglaDescuentoSerializer(regla).data
                })
                
        except ValidationError as e:
            return Response({
                'success': False,
                'message': 'Error de validación',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Eliminar regla"""
        try:
            instance = self.get_object()
            instance.delete()
            return Response({
                'success': True,
                'message': 'Regla eliminada exitosamente'
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error al eliminar: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    #regla-descuento/5/toggle_activo
    @action(detail=True, methods=['patch'])
    def toggle_activo(self, request, pk=None):
        """Activar/desactivar regla"""
        regla = self.get_object()
        regla.activo = not regla.activo
        regla.save()
        
        return Response({
            'success': True,
            'message': f'Regla {"activada" if regla.activo else "desactivada"}',
            'data': {'activo': regla.activo}
        })

    #regla-descuento/activas
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """Obtener solo reglas activas y vigentes"""
        hoy = timezone.now().date()
        reglas_activas = self.queryset.filter(
            activo=True,
            fecha_inicio__lte=hoy,
            fecha_fin__gte=hoy
        )
        
        serializer = self.get_serializer(reglas_activas, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': reglas_activas.count()
        })

    #regla-descuento/estadisticas
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas de reglas"""
        hoy = timezone.now().date()
        total = self.queryset.count()
        activas = self.queryset.filter(activo=True, fecha_inicio__lte=hoy, fecha_fin__gte=hoy).count()
        vencidas = self.queryset.filter(fecha_fin__lt=hoy).count()
        programadas = self.queryset.filter(fecha_inicio__gt=hoy).count()
        
        return Response({
            'success': True,
            'data': {
                'total': total,
                'activas': activas,
                'vencidas': vencidas,
                'programadas': programadas
            }
        })