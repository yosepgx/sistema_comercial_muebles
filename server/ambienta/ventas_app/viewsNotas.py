
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Pedido
from .serializers import NotaSerializer
from oportunidades_app.models import Oportunidad, Cotizacion
from django.utils import timezone
from rest_framework.exceptions import ValidationError
import xml.etree.ElementTree as ET
from ajustes_app.models import Dgeneral
from .services import CorrelativoService
from rest_framework.generics import CreateAPIView
from django.shortcuts import get_object_or_404

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


class NotaViewSet(CreateAPIView):
    queryset = Pedido.objects.filter(
        tipo_comprobante__in=[
            Pedido.TIPONCBOLETA, Pedido.TIPONCFACTURA,
            Pedido.TIPONDBOLETA, Pedido.TIPONDFACTURA
        ]
    ).order_by('-id')
    serializer_class = NotaSerializer

    def perform_create(self, serializer):
        pedido_original = serializer.validated_data.get('documento_referencia')

        if not pedido_original:
            raise ValidationError(code="NOTA_ERR09", detail="Debe indicar un documento de referencia.")
    
        cotizacion = pedido_original.cotizacion
        if cotizacion is None:
            raise ValidationError(code="NOTA_ERR06", detail="El pedido original no tiene una cotización asociada.")

        sede = cotizacion.oportunidad.sede

        resultado = CorrelativoService.obtener_guardar_siguiente_correlativo(
            sede_id=sede.id,
            tipo_documento=serializer.validated_data['tipo_comprobante'],
            documento_origen_id=pedido_original.id
        )

        nota = serializer.save()

        # Asignar los campos de serie y correlativo
        nota.serie = resultado['serie']
        nota.correlativo = resultado['correlativo']
        nota.save()

        tipo_nota = nota.tipo_nota  

        #quitar las cantidades y devolver a stock
        if tipo_nota in [Pedido.CTIPOANULACION, Pedido.CTIPODEVOLUCIONTOT, Pedido.CTIPOANULACIONRUC]:
            
            #si esta en pagado ya comprometio -> quita lo comprometido y lo pone en disponible
            if pedido_original.estado_pedido == Pedido.PAGADO:
                lineas = pedido_original.detalles.all()
                for linea in lineas:
                    cantidad = linea.cantidad
                    registro = linea.producto.registros_inventario.first()
                    if not registro:
                        raise ValidationError(code="NOTA_ERR07",detail=f"El producto '{linea.producto}' no tiene registro de inventario.")
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
                        raise ValidationError(code="NOTA_ERR08",detail=f"El producto '{linea.producto}' no tiene registro de inventario.")
                    registro.cantidad_disponible += cantidad
                    registro.save()
        #si no esta ni pagado ni despachado (pendiente o anulado) no pasa nada con cantidades
                #pero si se tiene que marcar como rechazado todo lo anterior en caso pendiente
                #si esta anulado no se deberia poder emitir nota (serializer)
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


ET.register_namespace("cbc", "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2")
ET.register_namespace("cac", "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2")

NSMAP = {
    'cbc': "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    'cac': "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
}


class GenerarXMLNotaView(APIView):
    def get(self, request, pedido_id):
        try:
            nota = Pedido.objects.get(id=pedido_id)
            cliente = nota.documento_referencia.cotizacion.oportunidad.cliente
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

        # Fecha 
        ET.SubElement(documento, "cbc:IssueDate").text = nota.fecha.strftime("%Y-%m-%d")
        #ET.SubElement(documento, "cbc:IssueTime").text = nota.fecha.strftime("%H:%M:%S")

        # Tipo de moneda
        ET.SubElement(documento, "cbc:DocumentCurrencyCode").text = "PEN"

        # Referencia al documento modificado
        nota_tipo = 1 
        if nota.tipo_nota == Pedido.CTIPOANULACION:
            nota_tipo = 1
        elif nota.tipo_nota == Pedido.CTIPOANULACIONRUC:
            nota_tipo = 2
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
        ET.SubElement(documento_referencia, "cbc:ResponseCode").text = str(nota_tipo)
        ET.SubElement(documento_referencia, "cbc:Description").text = motivo_nota
        
        # Tipo de documento modificado
        billing_ref = ET.SubElement(documento, "cac:BillingReference")
        invoice_ref = ET.SubElement(billing_ref, "cac:InvoiceDocumentReference")
        ET.SubElement(invoice_ref, "cbc:ID").text = f"{nota.documento_referencia.serie}-{int(nota.documento_referencia.correlativo):08d}"
        invoice_type_code_value = "01" if nota.documento_referencia.tipo_comprobante == Pedido.TIPOFACTURA else "03"
        ET.SubElement(invoice_ref, "cbc:DocumentTypeCode").text = invoice_type_code_value  # "01" o "03"

        # Datos del emisor (nombre comercial, razonsocial, tipo y numero de ruc)#################
        supplier_main_party = ET.SubElement(documento, "cac:AccountingSupplierParty")
        supplier_party = ET.SubElement(supplier_main_party, "cac:Party")
        #supplier_name = ET.SubElement(supplier_party, "cac:PartyName")
        #ET.SubElement(supplier_name, "cbc:Name").text = general.nombre_comercial

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

        # Total 
        total = ET.SubElement(documento, "cac:LegalMonetaryTotal")
        ET.SubElement(total, "cbc:PayableAmount", currencyID="PEN").text = f"{nota.monto_total:.2f}"

        # Líneas (similar a invoice, pero usando cac:CreditNoteLine)
        for i, item in enumerate(nota.detalles.all(), start=1):
            line = ET.SubElement(documento, "cac:CreditNoteLine")
            ET.SubElement(line, "cbc:ID").text = str(i)
            ET.SubElement(line, "cbc:CreditedQuantity", attrib={"unitCode": item.producto.umedida_sunat}).text = str(item.cantidad)

            # Monto sin IGV, precio_unitario es Correccion
            valor_unitario_sin_igv = item.precio_unitario / (1 + item.producto.igv)
            valor_total_sin_igv = valor_unitario_sin_igv * item.cantidad
            precio_unitario_con_igv = item.precio_unitario
            #valor del item (linea)
            ET.SubElement(line, "cbc:LineExtensionAmount", currencyID="PEN").text = f"{valor_total_sin_igv :.2f}"

            #precio unitario de venta
            princing_reference = ET.SubElement(line, "cac:PricingReference")
            alternative_condition_price = ET.SubElement ( princing_reference, "cac:AlternativeConditionPrice")
            ET.SubElement(alternative_condition_price, "cbc:PriceAmount", currencyID = "PEN").text = f"{precio_unitario_con_igv :.2f}"
            ET.SubElement(alternative_condition_price, "cbc:PriceTypeCode",
                           attrib={
                               "listName" : "SUNAT:Indicador de Tipo de Precio",
                               "listAgencyName" : "PE:SUNAT",
                               "listURI" : "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo16",
                           }).text = '01' # siempre 01, 02 es para no onerosas

            # afectacion IGV al item
            tax_total = ET.SubElement(line, "cac:TaxTotal")
            igv = (valor_total_sin_igv ) * item.producto.igv #el producto.igv esta en 0.18 no 18
            ET.SubElement(tax_total, "cbc:TaxAmount", currencyID="PEN").text = f"{igv:.2f}"
            tax_subtotal = ET.SubElement(tax_total, "cac:TaxSubtotal")
            ET.SubElement(tax_subtotal, "cbc:TaxableAmount", currencyID="PEN").text = f"{valor_total_sin_igv :.2f}"
            ET.SubElement(tax_subtotal, "cbc:TaxAmount", currencyID="PEN").text = f"{igv:.2f}"

            tax_category = ET.SubElement(tax_subtotal, "cac:TaxCategory") 
            ET.SubElement(tax_category, "cbc:ID", attrib={ ##no esta en el ejemplo
                "schemeID": "UN/ECE 5305",
                "schemeName": "Tax Category Identifier",
                "schemeAgencyName": "United Nations Economic Commission for Europe"
            }).text = "S"
            ET.SubElement(tax_category, "cbc:Percent").text = f"{item.producto.igv * 100:.2f}"##tampoco esta en el ejemplo
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