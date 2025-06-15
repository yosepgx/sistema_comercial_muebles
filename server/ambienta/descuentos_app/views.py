from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from decimal import Decimal
from .models import ReglaDescuento
from datetime import datetime, timedelta
from copy import deepcopy

# views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import ReglaDescuento
from .serializers import ReglaDescuentoSerializer
from dateutil import parser
from rest_framework.exceptions import ValidationError

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
            producto=producto_id,
            activo=True,
            fecha_inicio__lte=timezone.now(),
            fecha_fin__gte=timezone.now()
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
    print("Ahora:", timezone.now())
    print("Fecha inicio:", regla.fecha_inicio)
    print("Fecha fin:", regla.fecha_fin)
    print("regla:", regla.porcentaje)
    print("regla:", regla.tipo_descuento)
    print("cantidad:", cantidad)
    print("precio_unitario:", precio_unitario)
    if regla.tipo_descuento == 'porcentaje':
        print("descuento: ", (precio_unitario * cantidad) * (regla.porcentaje / 100))
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


def validar_regla(data, instance = None):
        """Validaciones personalizadas"""

        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')

        if isinstance(fecha_inicio, str):
            fecha_inicio = parser.parse(fecha_inicio)
        if isinstance(fecha_fin, str):
            fecha_fin = parser.parse(fecha_fin)

        data['fecha_inicio'] = fecha_inicio
        data['fecha_fin'] = fecha_fin

        # Validar fechas
        if data.get('fecha_inicio') and data.get('fecha_fin'):
            if data['fecha_inicio'] >= data['fecha_fin']:
                raise ValidationError({'code':"DESCUENTO_ERR01", 'message': "La fecha fin debe ser posterior a la fecha inicio"})
        
        # Validar que tenga al menos un tipo de descuento
        if not data.get('porcentaje') and not data.get('monto_fijo'):
            if not (data.get('cantidad_pagada') and data.get('cantidad_libre')):
                raise ValidationError({'code':"DESCUENTO_ERR02", 'message': "Debe especificar al menos un tipo de descuento"})
        
        # Validar porcentaje
        if data.get('porcentaje') and (data['porcentaje'] < 0 or data['porcentaje'] > 100):
            raise ValidationError({'code':"DESCUENTO_ERR03", 'message': "El porcentaje debe estar entre 0 y 100"})
        
        # Validar monto fijo
        if data.get('monto_fijo') and data['monto_fijo'] < 0:
            raise ValidationError({'code':"DESCUENTO_ERR04", 'message': "El monto fijo no puede ser negativo"})
            
        
        # Validar cantidades
        if data.get('cantidad_pagada', 0) < 0:
            raise ValidationError({'code':"DESCUENTO_ERR05", 'message': "La cantidad pagada no puede ser negativa"})
        
        if data.get('cantidad_libre', 0) < 0:
            raise ValidationError({'code':"DESCUENTO_ERR06", 'message': "La cantidad libre no puede ser negativa"})
        
        if data.get('cantidad_libre_maxima', 0) < 0:
            raise ValidationError({'code':"DESCUENTO_ERR07", 'message': "La cantidad libre máxima no puede ser negativa"})
        
        # Validar duplicados
        producto = data.get('producto')
        
        
        if producto and fecha_inicio and fecha_fin:
            query = ReglaDescuento.objects.filter(
                producto=producto,
                fecha_inicio__range=[fecha_inicio, fecha_fin],
                fecha_fin__range = [fecha_inicio, fecha_fin]
            )
            
            # Si estamos editando, excluir el registro actual
            if instance:
                query = query.exclude(pk=instance.pk)
                
            if query.exists():
                raise ValidationError({'code':"DESCUENTO_ERR08", 'message':"Ya existe una regla para este producto en las fechas seleccionadas"})
        
        # Validaciones específicas por fecha (según estrategia)
        ahora = timezone.now()
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')

        if instance is None:
            # Caso CREACIÓN
            if fecha_inicio and fecha_inicio < ahora:
                raise ValidationError({'code':"DESCUENTO_ERR09", 'message': "No se puede crear una regla con fecha inicio en el pasado"})

            # Caso EDICIÓN
        else :
            if fecha_fin and fecha_fin < ahora:
                raise ValidationError({'code':"DESCUENTO_ERR10", 'message': "No puedes acortar la fecha de fin a antes de ahora."})
        


class ReglaDescuentoViewSet(viewsets.ModelViewSet):
    queryset = ReglaDescuento.objects.select_related('producto').all()
    serializer_class = ReglaDescuentoSerializer
    

    def create(self, request, *args, **kwargs):
        """Crear nueva regla con manejo de errores"""
        with transaction.atomic():
            data = request.data
            validar_regla(data )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            regla = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Regla de descuento creada exitosamente',
                'data': ReglaDescuentoSerializer(regla).data
            }, status=status.HTTP_201_CREATED)
            
        

    def update(self, request, *args, **kwargs):
        """Actualizar regla existente"""
        with transaction.atomic():
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            validar_regla(request.data, instance)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            

            ahora = timezone.now()
            afecta_hoy = instance.fecha_inicio <= ahora <= instance.fecha_fin

            campos_sensibles = [
                'fecha_inicio', 'fecha_fin', 'porcentaje', 'monto_fijo',
                'cantidad_pagada', 'cantidad_libre', 'cantidad_libre_maxima'
            ]

            cambios_sensibles = any(
                field in data and data[field] != getattr(instance, field)
                for field in campos_sensibles
            )

            if afecta_hoy and cambios_sensibles:
                # Cerrar la regla actual
                instance.fecha_fin = ahora - timedelta(seconds=1)
                instance.activo = False
                instance.save()

                # Crear nueva regla a partir de hoy con los datos nuevos
                nueva_data = deepcopy(request.data)
                nueva_data['fecha_inicio'] = timezone.now().replace(microsecond=0).isoformat()

                nueva_serializer = self.get_serializer(data=nueva_data)
                nueva_serializer.is_valid(raise_exception=True)
                nueva_regla = nueva_serializer.save()

                return Response({
                    'success': True,
                    'message': 'Regla anterior cerrada y nueva regla creada desde hoy',
                    'data': ReglaDescuentoSerializer(nueva_regla).data
                })

            else:
                # No afecta hoy o no hay cambios sensibles → update directo
                regla = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Regla actualizada exitosamente',
                    'data': ReglaDescuentoSerializer(regla).data
                })
                

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
        ahora = timezone.now()
        
        if not regla.activo:
        # Reglas para activación
            if regla.fecha_fin < ahora:
                return Response({
                    'success': False,
                    'message': 'No se puede activar una regla vencida',
                    'code': 'DESCUENTO_ERR_ACTIVAR_VENCIDA'
                }, status=status.HTTP_400_BAD_REQUEST)

        #bloquear la desactivacion de ya aplicados no seria necesario, no deberia afectar porque no vuelve a 
            #calcularse ya se guardo    
        #bloquear si estan incompletos tampoco porque ya le obligamos a datos completos en el front
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
        hoy = timezone.now()
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
        hoy = timezone.now()
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