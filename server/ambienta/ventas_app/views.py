from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from .services import ServiceCargarDataVenta  
from .models import Pedido, PedidoDetalle
from .serializers import PedidoSerializer, PedidoDetalleSerializer
from oportunidades_app.services import ServiceCargarDatosOportunidades
import openpyxl
from oportunidades_app.models import Oportunidad
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

#cuando un pedido se anula si estaba:


#      por validar: no pasa nada con el stock
#      si quiere editar debe de anular y crear otro, ademas en la observacion indicar que se equivoco
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def update(self, request, *args, **kwargs):
        """
        sobreescribe update para casos de pasar a pagado y por validar
        """
        partial = kwargs.pop('partial',False)
        instance = self.get_object()

        estado_anterior = instance.estado_pedido

        serializer = self.get_serializer(instance, data = request.data, partial = partial)
        serializer.is_valid(raise_exception = True)

        nuevo_estado = request.data.get('estado_pedido', estado_anterior)

        with transaction.atomic():
    #      por validar -> pagado: se bloquea el stock (pasa de stock general a stock comprometido)
            if estado_anterior == Pedido.PENDIENTE and nuevo_estado == Pedido.PAGADO:
                instance.fecha_pago = timezone.now().date()
                lineas = instance.detalles.all()
                for linea in lineas:
                    cantidad = linea.cantidad
                    registro = linea.producto.registros_inventario.first()
                    if not registro:
                        raise ValidationError(f"El producto '{linea.producto}' no tiene registro de inventario.")
                    registro.cantidad_disponible -= cantidad
                    registro.cantidad_comprometida += cantidad
                    registro.save()
            
    #      pagado -> anulado: se tiene que desbloquear los compromisos 
            if estado_anterior == Pedido.PAGADO and nuevo_estado == Pedido.ANULADO:
                lineas = instance.detalles.all()
                for linea in lineas:
                    cantidad = linea.cantidad
                    registro = linea.producto.registros_inventario.first()
                    if not registro:
                        raise ValidationError(f"El producto '{linea.producto}' no tiene registro de inventario.")
                    registro.cantidad_disponible += cantidad
                    registro.cantidad_comprometida -= cantidad
                    registro.save()

    #      pagado -> despachado: se descuenta el stock ( se quita de stock comprometido)
            if estado_anterior == Pedido.PAGADO and nuevo_estado == Pedido.DESPACHADO:
                instance.fecha_entrega = timezone.now().date()
                lineas = instance.detalles.all()
                for linea in lineas:
                    cantidad = linea.cantidad
                    registro = linea.producto.registros_inventario.first()
                    if not registro:
                        raise ValidationError(f"El producto '{linea.producto}' no tiene registro de inventario.")
                    registro.cantidad_comprometida -= cantidad
                    registro.save()

                oportunidad = instance.cotizacion.oportunidad
                if oportunidad:
                    oportunidad.estado_oportunidad = Oportunidad.GANADO
                    oportunidad.save()

    #      despachado -> anulado: se tiene que volver a agregar los productos a stock disponible 
    #                           -> si se cancela el codigo del comprobante sigue, no se modifica el comprobante
            if estado_anterior == Pedido.DESPACHADO and nuevo_estado == Pedido.ANULADO:
                #TODO: seria bueno tener fecha de anulacion
                lineas = instance.detalles.all()
                for linea in lineas:
                    cantidad = linea.cantidad
                    registro = linea.producto.registros_inventario.first()
                    if not registro:
                        raise ValidationError(f"El producto '{linea.producto}' no tiene registro de inventario.")
                    registro.cantidad_comprometida -= cantidad
                    registro.cantidad_disponible += cantidad
                    registro.save()

                oportunidad = instance.cotizacion.oportunidad
                if oportunidad:
                    oportunidad.estado_oportunidad = Oportunidad.EN_NEGOCIACION
                    oportunidad.save()
            
            self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)


class PedidoDetalleViewSet(viewsets.ModelViewSet):
    queryset = PedidoDetalle.objects.all()
    serializer_class = PedidoDetalleSerializer


class CargarDataPedidosView(APIView):
    parser_classes = (MultiPartParser, FormParser)  

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verificar que el archivo sea un Excel válido
            excel = openpyxl.load_workbook(archivo, read_only=True)
            hojas_requeridas = {'Pedido', 'PedidoDetalle', 'Oportunidad', 'Cotizacion', 'CotizacionDetalle'}
            hojas_disponibles = set(excel.sheetnames)

            # Verificar que todas las hojas requeridas estén en el archivo
            if not hojas_requeridas.issubset(hojas_disponibles):
                faltantes = hojas_requeridas - hojas_disponibles
                return Response({'error': f'Faltan las siguientes hojas: {", ".join(faltantes)}'},
                                status=status.HTTP_400_BAD_REQUEST)

            ServiceCargarDatosOportunidades.Oportunidades(archivo)
            ServiceCargarDatosOportunidades.Cotizacion(archivo)
            ServiceCargarDatosOportunidades.CotizacionDetalle(archivo)
            ServiceCargarDataVenta.Pedido(archivo)
            ServiceCargarDataVenta.PedidoDetalle(archivo)

            return Response({'mensaje': 'Carga de datos de inventario exitosa'}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)