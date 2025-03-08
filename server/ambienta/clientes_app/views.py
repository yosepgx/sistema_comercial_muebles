from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from .services import ServiceCargarDataClientes  

class CargarCategoriasView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDataClientes.Categorias(archivo)
            return Response({'mensaje': 'Carga de categorias exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CargarContactosView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDataClientes.Contactos(archivo)
            return Response({'mensaje': 'Carga de contactos exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CargarDocumentosView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDataClientes.Documentos(archivo)
            return Response({'mensaje': 'Carga de documentos exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
