from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from inventario_app.models import Almacen,CategoriaProducto, Inventario,Producto, Precio
from rest_framework import status
from .services import ServiceCargarDataInventario  
from inventario_app.serializers import AlmacenSerializer, CategoriaProductoSerializer, InventarioSerializer, ProductoSerializer, PrecioSerializer
from rest_framework import viewsets
import openpyxl
from rest_framework.decorators import action
from django.utils import timezone
from dateutil.relativedelta import relativedelta

#TODO: FALTA AGREGAR PERMISOS PARA ESTOS VIEW

class AlmacenViewSet(viewsets.ModelViewSet):
    queryset = Almacen.objects.all()
    serializer_class = AlmacenSerializer

class CategoriaProductoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaProductoSerializer

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.filter(producto__activo = True, almacen__activo = True)
    serializer_class = InventarioSerializer

class PrecioViewSet(viewsets.ModelViewSet):
    queryset = Precio.objects.filter(producto__activo = True)
    serializer_class = PrecioSerializer
    
#al hacer post mandar un atributo "precio": valor tambien
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.filter(categoria__activo = True)
    serializer_class = ProductoSerializer

    def _create_precio(self, producto, newvalor):
        """Método privado para crear un nuevo precio y desactivar los anteriores"""
        # Desactivar precios anteriores
        precios_antiguos = Precio.objects.filter(
            producto=producto,
            activo=True
        )
        
        for precio in precios_antiguos:
            precio.activo = False
            precio.fecha_fin = timezone.now()
            precio.save()
        
        # Crear nuevo precio activo
        return Precio.objects.create(
            producto=producto,
            valor=newvalor,
            fecha_inicio=timezone.now(),
            fecha_fin = timezone.now() + relativedelta(years=1)
,
            activo=True
        )
    
    def perform_create(self, serializer):
        # Crear el producto
        producto = serializer.save()
        
        # Si se proporcionó un precio, crearlo también
        precio_valor = self.request.data.get('precio')
        if precio_valor:
            self._create_precio(producto, precio_valor)
    
    def perform_update(self, serializer):
        # Actualizar el producto
        producto = serializer.save()
        
        # Si se proporcionó un precio, crear uno nuevo
        precio_valor = self.request.data.get('precio')
        if precio_valor:
            self._create_precio(producto, precio_valor)
    
    @action(detail=True, methods=['get'])
    def precios(self, request, pk=None):
        """Endpoint para obtener todos los precios de un producto"""
        producto = self.get_object()
        precios = Precio.objects.filter(producto=producto).order_by('-fecha_inicio')
        serializer = PrecioSerializer(precios, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_precio(self, request, pk=None):
        """Endpoint para añadir un nuevo precio a un producto"""
        producto = self.get_object()
        
        # Asegurarse de que se proporciona un valor de precio
        precio_valor = request.data.get('valor')
        if not precio_valor:
            return Response(
                {"error": "Debe proporcionar un valor para el precio"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Usar el método privado para crear el precio
        precio = self._create_precio(producto, precio_valor)
        
        serializer = PrecioSerializer(precio)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class CargarInventariosView(APIView):
    parser_classes = (MultiPartParser, FormParser)  

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se proporcionó un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verificar que el archivo sea un Excel válido
            excel = openpyxl.load_workbook(archivo, read_only=True)
            hojas_requeridas = {'Inventario', 'Almacen', 'Producto', 'Categoria'}
            hojas_disponibles = set(excel.sheetnames)

            # Verificar que todas las hojas requeridas estén en el archivo
            if not hojas_requeridas.issubset(hojas_disponibles):
                faltantes = hojas_requeridas - hojas_disponibles
                return Response({'error': f'Faltan las siguientes hojas: {", ".join(faltantes)}'},
                                status=status.HTTP_400_BAD_REQUEST)

            ServiceCargarDataInventario.Categorias(archivo)
            ServiceCargarDataInventario.Productos(archivo)
            ServiceCargarDataInventario.Precios(archivo)
            ServiceCargarDataInventario.Almacenes(archivo)
            ServiceCargarDataInventario.DataInventario(archivo)

            return Response({'mensaje': 'Carga de datos de inventario exitosa'}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)