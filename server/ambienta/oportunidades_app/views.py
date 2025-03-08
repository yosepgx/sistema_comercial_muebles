from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from .services import ServiceCargarDatosOportunidades  # Importa la clase de servicios

class CargarOportunidadesView(APIView):
    parser_classes = (MultiPartParser, FormParser)  # Permite recibir archivos

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDatosOportunidades.Oportunidades(archivo)
            return Response({'mensaje': 'Carga de oportunidades exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CargarCotizacionView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDatosOportunidades.Cotizacion(archivo)
            return Response({'mensaje': 'Carga de cotización exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CargarCotizacionDetalleView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDatosOportunidades.CotizacionDetalle(archivo)
            return Response({'mensaje': 'Carga de detalles de cotización exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
