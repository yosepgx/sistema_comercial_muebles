# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Sede

@receiver(post_save, sender=Sede)
def crear_series_default(sender, instance, created, **kwargs):
    """
    Crear series por defecto cuando se crea una nueva sede
    """
    if created:
        from ventas_app.models import SerieCorrelativo, Pedido

        tipos_documento = [
            {'tipo': Pedido.TIPOFACTURA, 'serie': 'F00'},
            {'tipo': Pedido.TIPOBOLETA, 'serie': 'B00'},
            {'tipo': Pedido.TIPONCBOLETA, 'serie': 'BC0'},
            {'tipo': Pedido.TIPONDBOLETA, 'serie': 'BD0'},
            {'tipo': Pedido.TIPONCFACTURA, 'serie': 'FC0'},
            {'tipo': Pedido.TIPONDFACTURA, 'serie': 'FD0'},
        ]
        
        for tipo_doc in tipos_documento:
            try:
                SerieCorrelativo.objects.create(
                    sede=instance,
                    tipo_comprobante=tipo_doc['tipo'],
                    serie=tipo_doc['serie'] + str(instance.id),
                    ultimo_correlativo=1,
                    activo=True
                )
            except Exception as e:
                print(f"Error al crear serie '{tipo_doc['serie']}' para la sede ID {instance.id}: {e}")