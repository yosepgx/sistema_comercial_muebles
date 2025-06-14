import pandas as pd
from clientes_app.models import Cliente
from ventas_app.models import PedidoDetalle, Pedido, SerieCorrelativo
from oportunidades_app.models import Cotizacion
from inventario_app.models import Producto
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
import xml.etree.ElementTree as ET
from decimal import Decimal, ROUND_HALF_UP
from collections import defaultdict
#Pedido -> PedidoDetalle
class CorrelativoService:
    """
    Servicio para generar correlativos automáticamente
    """
    
    # Mapeo de tipos de documento y sus series
    TIPOS_DOCUMENTO = {
        Pedido.TIPOFACTURA: 'F',
        Pedido.TIPOBOLETA: 'B',
    }
    
    @staticmethod
    def obtener_prefijo_serie(tipo_documento, documento_origen_id=None):
        """
        Obtiene el prefijo de serie según el tipo de documento
        
        Args:
            tipo_comprobante (str): especificar el tipo de comprobante como TIPONC o TIPOND
            documento_origen_id (int): ID del documento origen (para notas)
            
        Returns:
            str: Prefijo de la serie (F, B, FC, BC, FD, BD)
        """
        if tipo_documento in [Pedido.TIPOFACTURA, Pedido.TIPOBOLETA]:
            return CorrelativoService.TIPOS_DOCUMENTO[tipo_documento]
        
        elif tipo_documento in [Pedido.TIPONCBOLETA, Pedido.TIPONCFACTURA, Pedido.TIPONDBOLETA, Pedido.TIPONDFACTURA]:
            if not documento_origen_id:
                raise Exception(f"Para {tipo_documento} se requiere documento_origen_id")
            
            try:
                documento_origen = Pedido.objects.get(id=documento_origen_id)
                tipo_origen = documento_origen.tipo_comprobante
                
                if tipo_origen == Pedido.TIPOFACTURA:
                    return 'FC' if tipo_documento == Pedido.TIPONCFACTURA else 'FD'
                elif tipo_origen == Pedido.TIPOBOLETA:
                    return 'BC' if tipo_documento == Pedido.TIPONCBOLETA else 'BD'
                else:
                    raise Exception(f"No se puede crear {tipo_documento} de un documento tipo {tipo_origen}")
                    
            except Pedido.DoesNotExist:
                raise Exception(f"Documento origen {documento_origen_id} no encontrado")
        
        else:
            raise Exception(f"Tipo de comprobante {tipo_documento} no válido")
        
    
    @staticmethod
    def obtener_guardar_siguiente_correlativo(sede_id, tipo_documento, documento_origen_id=None):
        """
        No solo obtiene el siguiente correlativo para un tipo de documento y sede específica sino 
        tambien lo guarda. NO necesita cambios para NC y ND porque al crearse sedes ya se crean con 
        el codigo necesario BC FC BD FD, solo tiene que sumar 1 
        
        Args:
            sede_id (int): ID de la sede
            tipo_documento (str): factura, boleta, nota_credito_boleta, nota_credito_factura
            , nota_debito_boleta, nota_debito_factura
            documento_origen_id (int): ID del documento origen (requerido para notas)
            
        Returns:
            dict: Diccionario con serie, correlativo y número completo para que sea asignado al
            Pedido o NC o ND creado, afuera se hace el guardado
        """
        try:
            with transaction.atomic():
                # Obtener el tipo de serie completo para la consulta
                
                serie_correlativo = SerieCorrelativo.objects.select_for_update().get(
                    sede=sede_id,
                    tipo_comprobante=tipo_documento,
                    activo=True
                )
                
                
                # Formatear número completo
                numero_completo = f"{serie_correlativo.serie}-{serie_correlativo.ultimo_correlativo:08d}"
                
                resultado = {
                    'serie': serie_correlativo.serie,
                    'correlativo': str(serie_correlativo.ultimo_correlativo).zfill(8),
                    'numero_completo': numero_completo,
                    'tipo_comprobante': tipo_documento
                }
                
                # Para notas, agregar información del documento origen
                if documento_origen_id:
                    documento_origen = Pedido.objects.get(id=documento_origen_id)
                    resultado['documento_origen'] = {
                        'id': documento_origen_id,
                        'numero': documento_origen.numero_completo if hasattr(documento_origen, 'numero_completo') else f"{documento_origen.serie}-{documento_origen.correlativo}",
                        'tipo': documento_origen.tipo_comprobante
                    }

                # Incrementar correlativo
                serie_correlativo.ultimo_correlativo += 1
                serie_correlativo.save()
                
                return resultado
                
        except ObjectDoesNotExist:
            raise Exception(f"No existe configuración de serie para sede {sede_id} y tipo {tipo_documento}")
        

class ServiceCargarDataVenta:
    def Pedido(archivo):
        try:
            campos = {'fecha':str,'fechaentrega': str,'direccion': str,
                      'cotizacion': int,'moneda': str,'monto_sin_impuesto': float ,
                      'estado_pedido': str ,'fecha_pago': str,
                      'monto_total': float ,'monto_igv': float ,'codigo_tipo_tributo': int,
                      'observaciones': str ,
                      'descuento_adicional': float, 'activo':bool, 'serie': str, 'correlativo': str, 'tipo_comprobante':str, }
            df = pd.read_excel(archivo, sheet_name='Pedido', 
                               usecols=campos.keys(),
                               parse_dates=['fecha', 'fechaentrega','fecha_pago'],
                               )
            
            objetos = []
            df['observaciones'] = None
            for _, row in df.iterrows():
                datos = row.to_dict()
                
                id_cotizacion = datos.pop('cotizacion')
                cot = Cotizacion.objects.get(id=id_cotizacion)
                
                obj = Pedido(cotizacion = cot, **datos)
                objetos.append(obj)
            
            Pedido.objects.bulk_create(objetos)

        except Exception as e:
            print(e)

    def PedidoDetalle(archivo):
        try:
            campos = {'pedido':int , 'producto':int, 'cantidad': int, 'precio_unitario':float, 'descuento':float ,
                      'subtotal': float,'nrolinea': int ,'activo': bool}
            
            df = pd.read_excel(archivo, sheet_name='PedidoDetalle', 
                               usecols=campos.keys())
            
            objetos = []

            for _, row in df.iterrows():
                datos = row.to_dict()
                
                id_producto = datos.pop('producto')
                prod = Producto.objects.get(id=id_producto)

                id_pedido = datos.pop('pedido')
                ped = Pedido.objects.get(id=id_pedido)
                
                obj = PedidoDetalle(pedido = ped, producto = prod, **datos)
                objetos.append(obj)
            
            PedidoDetalle.objects.bulk_create(objetos)

        except Exception as e:
            print(e)



def redondear(valor):
    return Decimal(valor).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def generar_nodos_descuento_global_etree(detalle_items, descuento_auxiliar):
    if not descuento_auxiliar or descuento_auxiliar <= 0:
        return []  # No hay descuento

    # Calcular total sin IGV como base para prorrateo
    total_sin_igv = Decimal('0.00')
    for item in detalle_items:
        subtotal = Decimal(item.subtotal)
        afectacion = item.producto.codigo_afecion_igv
        tasa = Decimal(item.producto.igv or 0)

        if afectacion == "10":  # Gravado
            neto = subtotal / (1 + tasa)
        else:
            neto = subtotal  # No tiene IGV
        total_sin_igv += neto

    if total_sin_igv == 0:
        return []

    # Distribuir descuento proporcional
    agrupados = defaultdict(lambda: {
        'base': Decimal('0.00'),
        'igv': Decimal('0.00'),
        'tasa': Decimal('0.00')
    })

    for item in detalle_items:
        subtotal = Decimal(item.subtotal)
        afectacion = item.producto.codigo_afecion_igv
        tasa = Decimal(item.producto.igv or 0)

        if afectacion == "10":
            base_item = subtotal / (1 + tasa)
        else:
            base_item = subtotal

        proporcion = base_item / total_sin_igv
        descuento_auxiliar_con_igv = Decimal(descuento_auxiliar) * proporcion

        if afectacion == "10":
            descuento_auxiliar_base = descuento_auxiliar_con_igv / (1 + tasa)
            descuento_auxiliar_igv = descuento_auxiliar_con_igv - descuento_auxiliar_base
        else:
            descuento_auxiliar_base = descuento_auxiliar_con_igv
            descuento_auxiliar_igv = Decimal('0.00')

        agrupados[afectacion]['base'] += descuento_auxiliar_base
        agrupados[afectacion]['igv'] += descuento_auxiliar_igv
        agrupados[afectacion]['tasa'] = tasa

    nodos = []

    for cod_afectacion, data in agrupados.items():
        allowance = ET.Element('cac:AllowanceCharge')

        ET.SubElement(allowance, 'cbc:ChargeIndicator').text = 'false'
        ET.SubElement(allowance, 'cbc:AllowanceChargeReasonCode').text = '00'
        # ET.SubElement(allowance, 'cbc:MultiplierFactorNumeric').text = str(porcentaje)

        ET.SubElement(
            allowance, 'cbc:Amount', attrib={'currencyID': 'PEN'}
        ).text = str(redondear(data['base']))

        ET.SubElement(
            allowance, 'cbc:BaseAmount', attrib={'currencyID': 'PEN'}
        ).text = str(redondear(total_sin_igv))  

        nodos.append(allowance)

    return nodos
