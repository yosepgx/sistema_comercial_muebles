import pandas as pd
from clientes_app.models import Contacto
from oportunidades_app.models import Oportunidad, Cotizacion,CotizacionDetalle
from inventario_app.models import Producto
#TODO: carga de vendedor asignado
#oportunidades -> cotizacion -> cotizacionDetalle
class ServiceCargarDatosOportunidades:
    def Oportunidades(archivo):
        try:
            campos = {'contacto': int,'valor_neto': float ,'fecha_contacto': str,
                      'vendedor_asignado': int,'estado_oportunidad': str ,
                      'activo': bool}
            df = pd.read_excel(archivo, sheet_name='Oportunidad', 
                               usecols=campos.keys(),
                               parse_dates=['fecha_contacto'],
                               )
            objetos = []
            df['vendedor_asignado'] = None

            for _, row in df.iterrows():
                datos = row.to_dict()
                id_contacto = datos.pop('contacto')
                cont = Contacto.objects.get(id=id_contacto)
                
                obj = Oportunidad(contacto=cont, **datos)
                objetos.append(obj)
            
            Oportunidad.objects.bulk_create(objetos)
        except Exception as e:
            print("error en oportunidades", e)

    def Cotizacion(archivo):
        try:
            campos = {'fecha': str ,'estado_cotizacion': str ,'oportunidad': str ,'validez': int,
                      'monto_sin_impuesto': float,'monto_total': float,'monto_igv': float, 'descuento_adicional': float,
                      'observaciones': str,'direccion_entrega':str ,'activo': bool}
            df = pd.read_excel(archivo, sheet_name='Cotizacion', 
                               usecols=campos.keys(),
                               parse_dates=['fecha'],
                               )
            
            objetos = []
            df['observaciones'] = None
            for _, row in df.iterrows():
                datos = row.to_dict()
                
                id_oportunidad = datos.pop('oportunidad')
                op = Oportunidad.objects.get(id=id_oportunidad)
                
                obj = Cotizacion(oportunidad = op, **datos)
                objetos.append(obj)
            
            Cotizacion.objects.bulk_create(objetos)

        except Exception as e:
            print("error en cotizacion", e)

    def CotizacionDetalle(archivo):
        try:
            campos = {'producto': int, 'cotizacion': int, 
                      'cantidad': int,'descuento':float ,
                      'subtotal': float,'nrolinea': int ,'activo': bool}
            
            df = pd.read_excel(archivo, sheet_name='CotizacionDetalle', 
                               usecols=campos.keys())
            
            objetos = []

            for _, row in df.iterrows():
                datos = row.to_dict()
                
                id_producto = datos.pop('producto')
                prod = Producto.objects.get(id=id_producto)

                id_cotizacion = datos.pop('cotizacion')
                cotiz = Cotizacion.objects.get(id=id_cotizacion)
                
                obj = CotizacionDetalle(producto = prod, cotizacion = cotiz, **datos)
                objetos.append(obj)
            
            CotizacionDetalle.objects.bulk_create(objetos)

        except Exception as e:
            print("error en linea cotizacion", e)