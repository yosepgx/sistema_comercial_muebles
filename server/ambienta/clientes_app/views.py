from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework import viewsets
from .services import ServiceCargarDataClientes  
from .models import Cliente
from .serializers import ClienteSerializer
import openpyxl

#DocumentoID -> Contacto
# class DocumentoIDViewSet(viewsets.ModelViewSet):
#     queryset = DocumentoID.objects.all()
#     serializer_class = DocumentoIDSerializer

#cuando haya un pedido despachado se revisa si el contacto asociado es un lead, si lo es entonces se lo pasa a cliente
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class CargarDataClienteView(APIView):
    parser_classes = (MultiPartParser, FormParser)  

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verificar que el archivo sea un Excel válido
            excel = openpyxl.load_workbook(archivo, read_only=True)
            hojas_requeridas = {'Cliente'}
            hojas_disponibles = set(excel.sheetnames)

            # Verificar que todas las hojas requeridas estén en el archivo
            if not hojas_requeridas.issubset(hojas_disponibles):
                faltantes = hojas_requeridas - hojas_disponibles
                return Response({'error': f'Faltan las siguientes hojas: {", ".join(faltantes)}'},
                                status=status.HTTP_400_BAD_REQUEST)

            ServiceCargarDataClientes.Clientes(archivo)
            #ServiceCargarDataClientes.Documentos(archivo)

            return Response({'mensaje': 'Carga de datos de clientes exitosa'}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)