from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from .services import ServiceCargarDataVenta  
from .models import Pedido, PedidoDetalle
from .serializers import PedidoSerializer, PedidoDetalleSerializer, NotaSerializer
from oportunidades_app.services import ServiceCargarDatosOportunidades
import openpyxl
from oportunidades_app.models import Oportunidad, Cotizacion
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
import xml.etree.ElementTree as ET
from datetime import datetime
import pandas as pd
from io import BytesIO
from ajustes_app.models import Dgeneral
from decimal import Decimal
from django.template.loader import render_to_string
from weasyprint import HTML
from .services import CorrelativoService
#cuando un pedido se anula si estaba:
#TODO: puede ser necesario en ambos views
# if registro.cantidad_comprometida < cantidad:
#     raise ValidationError(f"Stock comprometido insuficiente para '{linea.producto}'.")

def obtener_notas_credito_devolucion(pedido: Pedido):
    return Pedido.objects.filter(
    documento_referencia=pedido,
    tipo_comprobante__in=[
        Pedido.TIPONCBOLETA,
        Pedido.TIPONCFACTURA
    ]
)

def obtener_notas_debito_de(pedido: Pedido):
    return Pedido.objects.filter(
            documento_referencia=pedido,
            tipo_comprobante__in=[
                Pedido.TIPONDBOLETA,
                Pedido.TIPONDFACTURA
            ]
        )

class NotaViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.filter(
        tipo_comprobante__in=[
            Pedido.TIPONCBOLETA, Pedido.TIPONCFACTURA,
            Pedido.TIPONDBOLETA, Pedido.TIPONDFACTURA
        ]
    ).order_by('-id')
    serializer_class = NotaSerializer

    def perform_create(self, serializer):
        nota = serializer.save()
        
        pedido_original = nota.documento_referencia 
        

        cotizacion = pedido_original.cotizacion
        if cotizacion is None:
            raise ValidationError("El pedido original no tiene una cotización asociada.")
        
        sede = cotizacion.oportunidad.sede
        
        CorrelativoService.guardar_siguiente_correlativo(sede_id=sede.id, tipo_documento=nota.tipo_comprobante, documento_origen_id=pedido_original.id)
        tipo_nota = nota.tipo_nota

        #quitar las cantidades y devolver a stock
        if tipo_nota in [Pedido.CTIPOANULACION, Pedido.CTIPODEVOLUCIONTOT]:
            #si esta en pagado ya comprometio -> quita lo comprometido y lo pone en disponible
            if pedido_original.estado_pedido == Pedido.PAGADO:
                lineas = pedido_original.detalles.all()
                for linea in lineas:
                    cantidad = linea.cantidad
                    registro = linea.producto.registros_inventario.first()
                    if not registro:
                        raise ValidationError(f"El producto '{linea.producto}' no tiene registro de inventario.")
                    registro.cantidad_comprometida -= cantidad
                    registro.cantidad_disponible += cantidad
                    registro.save()
                ncs = obtener_notas_credito_devolucion(pedido_original)
                
            #si esta en despachado ya lo desconto -> regresar lo que desconto al disponible
            if pedido_original.estado_pedido == Pedido.DESPACHADO:
                pedido_original.fecha_entrega = timezone.now().date()
                lineas = pedido_original.detalles.all()
                for linea in lineas:
                    cantidad = linea.cantidad
                    registro = linea.producto.registros_inventario.first()
                    if not registro:
                        raise ValidationError(f"El producto '{linea.producto}' no tiene registro de inventario.")
                    registro.cantidad_disponible += cantidad
                    registro.save()

            #Anular cotizacion original (no dejara crear otra porque esta en aceptada)
            cotizacion.estado_cotizacion = Cotizacion.RECHAZADA
            cotizacion.observaciones = "Anulacion del pedido"
            cotizacion.save()

            #oportunidad pasa a negociacion
            oportunidad = cotizacion.oportunidad
            if oportunidad.estado_oportunidad == Oportunidad.GANADO:
                oportunidad.estado_oportunidad = Oportunidad.EN_NEGOCIACION
                oportunidad.save()
                    
            # Anular el pedido original
            pedido_original.estado_pedido = Pedido.ANULADO
            pedido_original.save() 



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
            
            
    #      pagado -> anulado: se tiene que desbloquear los compromisos y se anula cotizacion
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

                cotizacion = instance.cotizacion
                cotizacion.estado_cotizacion = Cotizacion.RECHAZADA
                cotizacion.save()

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

    #      despachado -> anulado: se tiene que volver a agregar los productos a stock disponible y se anula cotizacion
    #                           -> si se cancela, el codigo del comprobante sigue, no se modifica el comprobante
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

                cotizacion = instance.cotizacion
                cotizacion.estado_cotizacion = Cotizacion.RECHAZADA
                cotizacion.save()
                
                oportunidad = instance.cotizacion.oportunidad
                if oportunidad.estado_oportunidad == Oportunidad.GANADO:
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
            cliente = pedido.cotizacion.oportunidad.cliente
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            general = Dgeneral.objects.get(id=1)
        except Dgeneral.DoesNotExist:
            return Response({'error': 'Datos de la empresa no encontrados'}, status=status.HTTP_404_NOT_FOUND)

        # Raíz
        documento = ET.Element("Invoice", attrib={
            "xmlns": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
            "xmlns:cac": NSMAP["cac"],
            "xmlns:cbc": NSMAP["cbc"]
        })
        #version del ubl
        ET.SubElement(documento, "cbc:UBLVersionID").text = "2.1"

        #version de estructura del documento
        ET.SubElement(documento, "cbc:CustomizationID").text = "2.0"

        #Numeracion Serie - Correlativo ID de factura
        ET.SubElement(documento, "cbc:ID").text = f"{pedido.serie}-{int(pedido.correlativo):08d}"

        #fecha de emision
        ET.SubElement(documento, "cbc:IssueDate").text = pedido.fecha.strftime("%Y-%m-%d")

        #hora de emision
        ET.SubElement(documento, "cbc:IssueTime").text = pedido.fecha.strftime("%H:%M:%S")


        invoice_type_code_value = "01" if pedido.tipo_comprobante == Pedido.TIPOFACTURA else "03"

        #Codigo de Tipo de Documento
        ET.SubElement(documento, 
            "cbc:InvoiceTypeCode", 
            attrib={
                "listAgencyName": "PE:SUNAT",
                "listName": "SUNAT:Identificador de Tipo de Documento",
                "listURI": "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01"
            }
            ).text = invoice_type_code_value
        
        #Tipo de moneda
        ET.SubElement(documento, "cbc:DocumentCurrencyCode",
                      attrib={
                          "listID" : "ISO 4217 Alpha" ,
                          "listName" : "Currency",
                          "listAgencyName": "United Nations Economic Commission for Europe",
                      }).text = "PEN"
        
        # Datos del emisor (nombre comercial, razonsocial, tipo y numero de ruc)#################
        supplier_main_party = ET.SubElement(documento, "cac:AccountingSupplierParty")
        supplier_party = ET.SubElement(supplier_main_party, "cac:Party")
        supplier_name = ET.SubElement(supplier_party, "cac:PartyName")
        ET.SubElement(supplier_name, "cbc:Name").text = general.nombre_comercial

        #razon social
        supplier_tax_scheme = ET.SubElement(supplier_party, "cac:PartyTaxScheme")
        ET.SubElement(supplier_tax_scheme, "cbc:RegistrationName").text = general.razon_social

        #ruc del emisor
        ET.SubElement(supplier_tax_scheme, "cbc:CompanyID",
                       attrib={
                           "schemeID" : "6",
                           "schemeName" : "SUNAT:Identificador de Documento de Identidad",
                           "schemeAgencyName" : "PE:SUNAT" ,
                           "schemeURI" : "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06",
                       }).text = general.codigo_RUC
        tax_scheme = ET.SubElement(supplier_tax_scheme, "cac:TaxScheme")
        ET.SubElement(tax_scheme, "cbc:ID").text = '-'

        #direccion 0000
        supplier_address = ET.SubElement(supplier_tax_scheme, "cac:RegistrationAddress")
        ET.SubElement(supplier_address,"cbc:AddressTypeCode").text = '0000'


        #Datos del cliente Customer#############
        # <cac:AccountingCustomerParty>
        customer_party = ET.SubElement(documento, "cac:AccountingCustomerParty")

        # <cac:Party>
        party = ET.SubElement(customer_party, "cac:Party")

        # <cac:PartyTaxScheme>
        party_tax_scheme = ET.SubElement(party, "cac:PartyTaxScheme")

        # <cbc:RegistrationName>
        ET.SubElement(party_tax_scheme, "cbc:RegistrationName").text = cliente.nombre

        # <cbc:CompanyID ...>
        customer_document_type = "6" if cliente.tipo_documento == 'RUC' else "1"
        ET.SubElement(
            party_tax_scheme,
            "cbc:CompanyID",
            attrib={
                "schemeID": customer_document_type,
                "schemeName": "SUNAT:Identificador de Documento de Identidad",
                "schemeAgencyName": "PE:SUNAT",
                "schemeURI": f"urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06",
            }
        ).text = cliente.documento

        # Relleno ID 
        tax_scheme = ET.SubElement(party_tax_scheme, "cac:TaxScheme")
        ET.SubElement(tax_scheme, "cbc:ID").text = "-"

        # Total
        total = ET.SubElement(documento, "cac:LegalMonetaryTotal")
        ET.SubElement(total, "cbc:PayableAmount", currencyID="PEN").text = f"{pedido.monto_total:.2f}"

        # Líneas de productos cac:InvoiceLine
        for i, item in enumerate(pedido.detalles.all(), start=1):
            line = ET.SubElement(documento, "cac:InvoiceLine")
            ET.SubElement(line, "cbc:ID").text = str(i)
            ET.SubElement(line, "cbc:InvoicedQuantity", attrib={
                "unitCode" : item.producto.umedida_sunat,
            } ).text = str(item.cantidad)

            # si es unitario es al producto si es item es a la linea
            #valor de venta por item -> subtotal sin igv
            factor_igv = item.producto.igv
            descuento_item_sin_igv = item.descuento / (1 + factor_igv)
            descuento_unitario_con_igv = item.descuento / item.cantidad
            valor_unitario_sin_igv = item.precio_unitario / (1 + factor_igv) #el valor siempre ya lo guardo sin el descuento aplicado

            descuento_item_con_igv = item.descuento
            precio_unitario_con_igv = item.precio_unitario

            valor_item_sin_igv = (valor_unitario_sin_igv * item.cantidad) 
            #subtotal_sin_igv de la linea
            ET.SubElement(line, "cbc:LineExtensionAmount", currencyID="PEN").text = f"{valor_item_sin_igv - descuento_item_sin_igv :.2f}"

            #precio unitario de venta
            princing_reference = ET.SubElement(line, "cac:PricingReference")
            alternative_condition_price = ET.SubElement ( princing_reference, "cac:AlternativeConditionPrice")
            ET.SubElement(alternative_condition_price, "cbc:PriceAmount", currencyID = "PEN").text = f"{precio_unitario_con_igv - descuento_unitario_con_igv :.2f}"
            ET.SubElement(alternative_condition_price, "cbc:PriceTypeCode",
                           attrib={
                               "listName" : "SUNAT:Indicador de Tipo de Precio",
                               "listAgencyName" : "PE:SUNAT",
                               "listURI" : "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo16",
                           }).text = '01' # siempre 01
            
            

            #descuento por item (linea)
            allowance_change = ET.SubElement(line, "cac:AllowanceCharge")
            ET.SubElement(allowance_change, "cbc:ChargeIndicator").text = "false"
            ET.SubElement(allowance_change, "cbc:AllowanceChargeReasonCode").text = "00" #00-descuentos 01-detracion 02-retencion
            ET.SubElement(allowance_change, "cbc:Amount", currencyID = 'PEN').text = f"{descuento_item_sin_igv :.2f}"
            ET.SubElement(allowance_change, "cbc:BaseAmount", currencyID = 'PEN').text = f"{valor_item_sin_igv :.2f}"

            #igv por item
            tax_total = ET.SubElement(line, "cac:TaxTotal")
            ET.SubElement(tax_total,"cbc:TaxAmount", currencyID="PEN").text = f"{(valor_item_sin_igv - descuento_item_sin_igv) * factor_igv :.2f}"
            tax_subtotal = ET.SubElement(tax_total, "cac:TaxSubtotal")
            ET.SubElement(tax_subtotal, "cbc:TaxableAmount").text = f"{valor_item_sin_igv - descuento_item_sin_igv :.2f}"
            ET.SubElement(tax_subtotal, "cbc:TaxAmount").text = f"{(valor_item_sin_igv - descuento_item_sin_igv) * factor_igv :.2f}"
            tax_category = ET.SubElement(tax_subtotal, "cac:TaxCategory")
            ET.SubElement(tax_category, "cbc:ID", 
                          attrib={
                                "schemeID" : "UN/ECE 5305",
                                "schemeName" : "Tax Category Identifier",
                                "schemeAgencyName" : "United Nations Economic Commission for Europe"
                                }).text = "S"
            ET.SubElement(tax_category, "cbc:Percent").text = f"{item.producto.igv * 100 :.2f}"
            ET.SubElement(tax_category, "cbc:TaxExemptionReasonCode",
                          attrib= {
                                "listAgencyName" : "PE:SUNAT",
                                "listName" : "SUNAT:Codigo de Tipo de Afectación del IGV",
                                "listURI" : "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo07"
                          }).text = item.producto.codigo_afecion_igv
            
            area_tributo = ET.SubElement(tax_category, "cac:TaxScheme")
            ET.SubElement(area_tributo,"cbc:ID").text = '1000'
            ET.SubElement(area_tributo,"cbc:Name").text = 'IGV'
            ET.SubElement(area_tributo,"cbc:TaxTypeCode").text = 'VAT'

            #nombres de producto (descripcion detallada)
            item_elem = ET.SubElement(line, "cac:Item")
            ET.SubElement(item_elem, "cbc:Description").text = item.producto.nombre
            
            #valor unitario del item
            price_elem = ET.SubElement(line, "cac:Price")
            ET.SubElement(price_elem, "cbc:PriceAmount", currencyID="PEN").text = f"{valor_unitario_sin_igv :.2f}"

        xml_bytes = ET.tostring(documento, encoding='utf-8', xml_declaration=True)

        response = HttpResponse(xml_bytes, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename=Documento_{pedido.id}.xml'
        return response


class GenerarXMLNotaView(APIView):
    def get(self, request, pedido_id):
        try:
            nota = Pedido.objects.get(id=pedido_id)
            cliente = nota.cotizacion.oportunidad.cliente
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        try:
            general = Dgeneral.objects.get(id=1)
        except Dgeneral.DoesNotExist:
            return Response({'error': 'Datos de la empresa no encontrados'}, status=status.HTTP_404_NOT_FOUND)

        # Crear raíz
        documento = ET.Element("CreditNote", attrib={
            "xmlns": "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2",
            "xmlns:cac": NSMAP["cac"],
            "xmlns:cbc": NSMAP["cbc"]
        })

        # Versiones UBL y estructura
        ET.SubElement(documento, "cbc:UBLVersionID").text = "2.1"
        ET.SubElement(documento, "cbc:CustomizationID").text = "2.0"

        # Numeración
        ET.SubElement(documento, "cbc:ID").text = f"{nota.serie}-{int(nota.correlativo):08d}"

        # Fecha y hora
        ET.SubElement(documento, "cbc:IssueDate").text = nota.fecha.strftime("%Y-%m-%d")
        ET.SubElement(documento, "cbc:IssueTime").text = nota.fecha.strftime("%H:%M:%S")

        # Tipo de moneda
        ET.SubElement(documento, "cbc:DocumentCurrencyCode").text = "PEN"

        # Referencia al documento modificado
        nota_tipo = 1 
        if nota.tipo_nota == Pedido.CTIPOANULACION:
            nota_tipo = 1
        elif nota.tipo_nota == Pedido.CTIPODESCGLOBAL:
            nota_tipo = 4  
        elif nota.tipo_nota == Pedido.CTIPODECITEM:
            nota_tipo = 5
        elif nota.tipo_nota == Pedido.CTIPODEVOLUCIONTOT:
            nota_tipo = 6
        motivo_nota = nota.observaciones

        #codigo del tipo de nota y motivo
        documento_referencia = ET.SubElement(documento, "cac:DiscrepancyResponse")
        ET.SubElement(documento_referencia, "cbc:ReferenceID").text = f"{nota.documento_referencia.serie}-{int(nota.documento_referencia.correlativo):08d}"  # Ej: "F001-1234"
        ET.SubElement(documento_referencia, "cbc:ResponseCode").text = nota_tipo
        ET.SubElement(documento_referencia, "cbc:Description").text = motivo_nota
        
        # Tipo de documento modificado
        billing_ref = ET.SubElement(documento, "cac:BillingReference")
        invoice_ref = ET.SubElement(billing_ref, "cac:CreditNoteDocumentReference")
        ET.SubElement(invoice_ref, "cbc:ID").text = f"{nota.documento_referencia.serie}-{int(nota.documento_referencia.correlativo):08d}"
        invoice_type_code_value = "01" if nota.tipo_comprobante == Pedido.TIPOFACTURA else "03"
        ET.SubElement(invoice_ref, "cbc:DocumentTypeCode").text = invoice_type_code_value  # "01" o "03"

        # Datos del emisor (nombre comercial, razonsocial, tipo y numero de ruc)#################
        supplier_main_party = ET.SubElement(documento, "cac:AccountingSupplierParty")
        supplier_party = ET.SubElement(supplier_main_party, "cac:Party")
        supplier_name = ET.SubElement(supplier_party, "cac:PartyName")
        ET.SubElement(supplier_name, "cbc:Name").text = general.nombre_comercial

        #razon social
        supplier_tax_scheme = ET.SubElement(supplier_party, "cac:PartyTaxScheme")
        ET.SubElement(supplier_tax_scheme, "cbc:RegistrationName").text = general.razon_social

        #ruc del emisor
        ET.SubElement(supplier_tax_scheme, "cbc:CompanyID",
                       attrib={
                           "schemeID" : "6",
                           "schemeName" : "SUNAT:Identificador de Documento de Identidad",
                           "schemeAgencyName" : "PE:SUNAT" ,
                           "schemeURI" : "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06",
                       }).text = general.codigo_RUC
        tax_scheme = ET.SubElement(supplier_tax_scheme, "cac:TaxScheme")
        ET.SubElement(tax_scheme, "cbc:ID").text = '-'

        #direccion 0000
        supplier_address = ET.SubElement(supplier_tax_scheme, "cac:RegistrationAddress")
        ET.SubElement(supplier_address,"cbc:AddressTypeCode").text = '0000'

        #Datos del cliente Customer#######################################
        # <cac:AccountingCustomerParty>
        customer_party = ET.SubElement(documento, "cac:AccountingCustomerParty")

        # <cac:Party>
        party = ET.SubElement(customer_party, "cac:Party")

        # <cac:PartyTaxScheme>
        party_tax_scheme = ET.SubElement(party, "cac:PartyTaxScheme")

        # <cbc:RegistrationName>
        ET.SubElement(party_tax_scheme, "cbc:RegistrationName").text = cliente.nombre

        # <cbc:CompanyID ...>
        customer_document_type = "6" if cliente.tipo_documento == 'RUC' else "1"
        ET.SubElement(
            party_tax_scheme,
            "cbc:CompanyID",
            attrib={
                "schemeID": customer_document_type,
                "schemeName": "SUNAT:Identificador de Documento de Identidad",
                "schemeAgencyName": "PE:SUNAT",
                "schemeURI": f"urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06",
            }
        ).text = cliente.documento

        # Relleno ID 
        tax_scheme = ET.SubElement(party_tax_scheme, "cac:TaxScheme")
        ET.SubElement(tax_scheme, "cbc:ID").text = "-"

        # Total TODO: ver que monto deberia de estar aqui
        total = ET.SubElement(documento, "cac:LegalMonetaryTotal")
        ET.SubElement(total, "cbc:PayableAmount", currencyID="PEN").text = f"{nota.monto_total:.2f}"

        # Líneas (similar a invoice, pero usando cac:CreditNoteLine)
        for i, item in enumerate(nota.detalles.all(), start=1):
            line = ET.SubElement(documento, "cac:CreditNoteLine")
            ET.SubElement(line, "cbc:ID").text = str(i)
            ET.SubElement(line, "cbc:CreditedQuantity", attrib={"unitCode": item.producto.umedida_sunat}).text = str(item.cantidad)

            # Monto sin IGV
            valor_unitario_sin_igv = item.precio_unitario / (1 + item.producto.igv)
            valor_total_sin_igv = valor_unitario_sin_igv * item.cantidad
            descuento_item_sin_igv = item.descuento / (1 + item.producto.igv)
            ET.SubElement(line, "cbc:LineExtensionAmount", currencyID="PEN").text = f"{valor_total_sin_igv - descuento_item_sin_igv:.2f}"

            # Descuento
            allowance = ET.SubElement(line, "cac:AllowanceCharge")
            ET.SubElement(allowance, "cbc:ChargeIndicator").text = "false"
            ET.SubElement(allowance, "cbc:Amount", currencyID="PEN").text = f"{descuento_item_sin_igv:.2f}"
            ET.SubElement(allowance, "cbc:BaseAmount", currencyID="PEN").text = f"{valor_total_sin_igv:.2f}"

            # IGV
            tax_total = ET.SubElement(line, "cac:TaxTotal")
            igv = (valor_total_sin_igv - descuento_item_sin_igv) * item.producto.igv
            ET.SubElement(tax_total, "cbc:TaxAmount", currencyID="PEN").text = f"{igv:.2f}"
            tax_subtotal = ET.SubElement(tax_total, "cac:TaxSubtotal")
            ET.SubElement(tax_subtotal, "cbc:TaxableAmount", currencyID="PEN").text = f"{valor_total_sin_igv - descuento_item_sin_igv:.2f}"
            ET.SubElement(tax_subtotal, "cbc:TaxAmount", currencyID="PEN").text = f"{igv:.2f}"

            tax_category = ET.SubElement(tax_subtotal, "cac:TaxCategory")
            ET.SubElement(tax_category, "cbc:ID", attrib={
                "schemeID": "UN/ECE 5305",
                "schemeName": "Tax Category Identifier",
                "schemeAgencyName": "United Nations Economic Commission for Europe"
            }).text = "S"
            ET.SubElement(tax_category, "cbc:Percent").text = f"{item.producto.igv * 100:.2f}"
            ET.SubElement(tax_category, "cbc:TaxExemptionReasonCode").text = item.producto.codigo_afecion_igv

            tax_scheme = ET.SubElement(tax_category, "cac:TaxScheme")
            ET.SubElement(tax_scheme, "cbc:ID").text = "1000"
            ET.SubElement(tax_scheme, "cbc:Name").text = "IGV"
            ET.SubElement(tax_scheme, "cbc:TaxTypeCode").text = "VAT"

            item_elem = ET.SubElement(line, "cac:Item")
            ET.SubElement(item_elem, "cbc:Description").text = item.producto.nombre

            price_elem = ET.SubElement(line, "cac:Price")
            ET.SubElement(price_elem, "cbc:PriceAmount", currencyID="PEN").text = f"{valor_unitario_sin_igv:.2f}"

        # Serialización final
        xml_bytes = ET.tostring(documento, encoding='utf-8', xml_declaration=True)
        response = HttpResponse(xml_bytes, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename=NotaCredito_{nota.id}.xml'
        return response

class DescargarPedidos(APIView):
    def post(self, request):
        try:
            # Leer fechas del request
            fecha_inicio_str = request.data.get('fecha_inicio')
            fecha_fin_str = request.data.get('fecha_fin')

            if not fecha_inicio_str or not fecha_fin_str:
                return Response({"detail": "Debe proporcionar fecha_inicio y fecha_fin."},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
                fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"detail": "Formato de fecha inválido. Use 'YYYY-MM-DD'."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Validación de rango lógico
            if fecha_inicio > fecha_fin:
                return Response({"detail": "La fecha de inicio no puede ser mayor que la fecha de fin."},
                                status=status.HTTP_400_BAD_REQUEST)
            
            queryset = PedidoDetalle.objects.select_related(
                'pedido', 'producto'
            ).filter(pedido__fecha__range=(fecha_inicio, fecha_fin)).order_by('-id')

            if not queryset.exists():
                return Response({"detail": "No hay pedidos disponibles para exportar."}, status=status.HTTP_204_NO_CONTENT)

            data = []
            for detalle in queryset:
                ped = detalle.pedido
                data.append({
                    'Codigo pedido': ped.id,
                    'Fecha': ped.fecha.strftime('%Y-%m-%d'),
                    'CodProducto': detalle.producto.id,
                    'Producto': detalle.producto.nombre,
                    'Cantidad': detalle.cantidad,
                    'Precio Unitario': detalle.precio_unitario,
                    'Descuento Linea': detalle.descuento,
                    'Subtotal': detalle.subtotal,
                    'Activo': detalle.activo,
                })

            df = pd.DataFrame(data)
            if df.empty:
                return Response({"detail": "No hay datos para exportar."}, status=status.HTTP_204_NO_CONTENT)

            buffer = BytesIO()
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Pedidos')

            buffer.seek(0)
            response = HttpResponse(
                buffer.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="pedidos.xlsx"'
            return response
        
        except Exception as e:
            # Loguear en logger
            return Response(
                {"detail": "Error al generar el archivo Excel.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GenerarPDFGuiaRemisionView(APIView):
    def post(self, request, pedido_id):
        direccion_partida = request.data.get("direccion_partida")
        if not direccion_partida:
            return Response({"error": "Debe proporcionar la dirección de partida"}, status=400)

        try:
            pedido = Pedido.objects.prefetch_related("detalles__producto").get(id=pedido_id)
        except Pedido.DoesNotExist:
            return Response("Pedido no encontrado", status=404)

        detalles = pedido.detalles.filter(activo=True)

        html_string = render_to_string("guias_remision/pdf_guia_remision.html", {
            "pedido": pedido,
            "detalles": detalles,
            "direccion_partida": direccion_partida
        })

        pdf_bytes = HTML(string=html_string).write_pdf()

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="GuiaRemision_{pedido.serie}-{pedido.correlativo}.pdf"'
        return response