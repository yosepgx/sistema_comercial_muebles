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

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido
    serializer_class = PedidoSerializer

class PedidoDetalleViewSet(viewsets.ModelViewSet):
    queryset = PedidoDetalle
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