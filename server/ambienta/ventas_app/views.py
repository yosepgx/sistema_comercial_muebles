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
import xml.etree.ElementTree as ET
import datetime

#cuando un pedido se anula si estaba:


#      por validar: no pasa nada con el stock
#      si quiere editar debe de anular y crear otro, ademas en la observacion indicar que se equivoco
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-id')
    serializer_class = PedidoSerializer

    def get_queryset(self):
        cotizacion_id = self.request.query_params.get('cotizacion_id')
        if cotizacion_id:
            return Pedido.objects.filter(cotizacion_id=cotizacion_id)
        return super().get_queryset()
    
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

    def get_queryset(self):
        pedido_id = self.request.query_params.get('pedido_id')
        if pedido_id:
            return PedidoDetalle.objects.filter(pedido_id=pedido_id)
        return super().get_queryset()

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
        




ET.register_namespace("cbc", "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2")
ET.register_namespace("cac", "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2")

NSMAP = {
    'cbc': "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    'cac': "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
}

class GenerarXMLUBLView(APIView):
    def get(self, request, pedido_id):
        try:
            pedido = Pedido.objects.get(id=pedido_id)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Raíz
        factura = ET.Element("Invoice", attrib={
            "xmlns": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
            "xmlns:cac": NSMAP["cac"],
            "xmlns:cbc": NSMAP["cbc"]
        })

        # ID de factura y fecha
        ET.SubElement(factura, "cbc:ID").text = f"F001-{pedido.id:08d}"
        ET.SubElement(factura, "cbc:IssueDate").text = pedido.fecha.strftime("%Y-%m-%d")

        # Datos del proveedor (emisor)
        supplier_party = ET.SubElement(factura, "cac:AccountingSupplierParty")
        supplier = ET.SubElement(supplier_party, "cac:Party")
        ET.SubElement(supplier, "cbc:Name").text = "MI EMPRESA SAC"

        # Datos del cliente
        customer_party = ET.SubElement(factura, "cac:AccountingCustomerParty")
        customer = ET.SubElement(customer_party, "cac:Party")
        ET.SubElement(customer, "cbc:Name").text = pedido.cotizacion.oportunidad.cliente.nombre

        # Líneas de productos
        for i, item in enumerate(pedido.detalles.all(), start=1):
            line = ET.SubElement(factura, "cac:InvoiceLine")
            ET.SubElement(line, "cbc:ID").text = str(i)
            ET.SubElement(line, "cbc:InvoicedQuantity", unitCode=item.producto.umedida_sunat).text = str(item.cantidad)
            ET.SubElement(line, "cbc:LineExtensionAmount", currencyID="PEN").text = f"{item.precio_unitario * item.cantidad:.2f}"

            item_elem = ET.SubElement(line, "cac:Item")
            ET.SubElement(item_elem, "cbc:Description").text = item.producto.nombre

            price_elem = ET.SubElement(line, "cac:Price")
            ET.SubElement(price_elem, "cbc:PriceAmount", currencyID="PEN").text = f"{item.precio_unitario:.2f}"

        # Total
        total = ET.SubElement(factura, "cac:LegalMonetaryTotal")
        ET.SubElement(total, "cbc:PayableAmount", currencyID="PEN").text = f"{pedido.monto_total:.2f}"

        xml_bytes = ET.tostring(factura, encoding='utf-8', xml_declaration=True)

        response = HttpResponse(xml_bytes, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename=Factura_{pedido.id}.xml'
        return response
