from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from .services import ServiceCargarDataInventario  

class CargarCategoriasView(APIView):
    parser_classes = (MultiPartParser, FormParser)  

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDataInventario.Categorias(archivo)
            return Response({'mensaje': 'Carga de categorias producto exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CargarProductosView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDataInventario.Productos(archivo)
            return Response({'mensaje': 'Carga de productos exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CargarAlmacenesView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDataInventario.Almacenes(archivo)
            return Response({'mensaje': 'Carga de almacenes exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CargarInventariosView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ServiceCargarDataInventario.DataInventario(archivo)
            return Response({'mensaje': 'Carga de inventario exitosa'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)