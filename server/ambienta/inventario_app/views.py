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
from io import BytesIO
import pandas as pd

class DescargarStock(APIView):
    def post(self, request):
        try:
            # Consulta filtrada
            queryset = Inventario.objects.filter(producto__activo=True, almacen__activo=True)

            # Validación: ¿hay datos?
            if not queryset.exists():
                return Response(
                    {"detail": "No hay inventario disponible para exportar."},
                    status=status.HTTP_204_NO_CONTENT
                )

            # Extraer datos
            data = []
            for item in queryset:
                data.append({
                    'Codigo del Producto': item.producto.id,
                    'Nombre del Producto': item.producto.nombre,
                    'Stock': item.cantidad_disponible,
                    'Stock Comprometido': item.cantidad_comprometida,
                })

            df = pd.DataFrame(data)

            # Validación: ¿el DataFrame está vacío?
            if df.empty:
                return Response(
                    {"detail": "No hay datos para exportar."},
                    status=status.HTTP_204_NO_CONTENT
                )

            # Generar Excel en memoria
            buffer = BytesIO()
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Stock')

            buffer.seek(0)

            # Enviar archivo
            response = HttpResponse(
                buffer.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="stock.xlsx"'
            return response

        except Exception as e:
            # Loguear en logger
            return Response(
                {"detail": "Error al generar el archivo Excel.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class DescargarProductos(APIView):
    def post(self, request):
        try:
            # Consulta filtrada
            queryset = Producto.objects.all().order_by('id')

            # Validación: ¿hay datos?
            if not queryset.exists():
                return Response(
                    {"detail": "No hay productos disponibles para exportar."},
                    status=status.HTTP_204_NO_CONTENT
                )

            # Extraer datos
            data = []
            for p in queryset:
                data.append({
                    'codigo': p.id,
                    'nombre': p.nombre,
                    'precio': p.precio,
                    'categoria': p.categoria.descripcion,
                    'igv': p.igv,
                    'afecto_igv': p.afecto_igv,
                    'codigo_afecion_igv': p.codigo_afecion_igv,
                    'es_servicio': p.es_servicio,
                    'umedida': p.umedida_sunat,
                    'activo': p.activo,
                })


            df = pd.DataFrame(data)

            # Validación: ¿el DataFrame está vacío?
            if df.empty:
                return Response(
                    {"detail": "No hay datos para exportar."},
                    status=status.HTTP_204_NO_CONTENT
                )

            # Generar Excel en memoria
            buffer = BytesIO()
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Productos')

            buffer.seek(0)

            # Enviar archivo
            response = HttpResponse(
                buffer.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="productos.xlsx"'
            return response

        except Exception as e:
            # Loguear en logger
            return Response(
                {"detail": "Error al generar el archivo Excel.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
        
        # Si no es servicio, crear inventario en cada almacén activo
        if not producto.es_servicio:
            almacenes = Almacen.objects.filter(activo=True)
            for almacen in almacenes:
                Inventario.objects.create(
                    producto=producto,
                    almacen=almacen,
                    cantidad_disponible=0,
                    cantidad_comprometida=0
                )
                
    
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