import pandas as pd
from clientes_app.models import Cliente
from oportunidades_app.models import Oportunidad, Cotizacion,CotizacionDetalle
from inventario_app.models import Producto
from ajustes_app.models import Sede
#TODO: carga de vendedor asignado
#dgeneral -> sede -> oportunidades -> cotizacion -> cotizacionDetalle
class ServiceCargarDatosOportunidades:
    def Oportunidades(archivo):
        try:
            campos = {'cliente': int,'sede': int, 'fecha_contacto': str,
                      'estado_oportunidad': str ,
                      'activo': bool}
            df = pd.read_excel(archivo, sheet_name='Oportunidad', 
                               usecols=campos.keys(),
                               parse_dates=['fecha_contacto'],
                               )
            objetos = []

            for _, row in df.iterrows():
                datos = row.to_dict()
                id_cliente = datos.pop('cliente')
                id_sede = datos.pop('sede')
                cli = Cliente.objects.get(id=id_cliente)
                sed = Sede.objects.get(id=id_sede)
                
                obj = Oportunidad(cliente=cli, sede = sed , **datos)
                objetos.append(obj)
            
            Oportunidad.objects.bulk_create(objetos)
        except Exception as e:
            print("error en oportunidades", e)

    def Cotizacion(archivo):
        try:
            campos = {'fecha': str ,'estado_cotizacion': str ,'oportunidad': str ,
                      'monto_sin_impuesto': float,'monto_total': float,'monto_igv': float, 'descuento_adicional': float,
                      'observaciones': str,'direccion_entrega':str , 'vendedor':str, 'activo': bool}
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

                #getVendedor - Usuario  
                
                obj = Cotizacion(oportunidad = op, **datos)
                objetos.append(obj)
            
            Cotizacion.objects.bulk_create(objetos)

        except Exception as e:
            print("error en cotizacion", e)

    def CotizacionDetalle(archivo):
        try:
            campos = {'producto': int, 'cotizacion': int, 
                      'cantidad': int, 'precio_unitario': float,'descuento':float ,
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