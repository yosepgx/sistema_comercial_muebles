import pandas as pd
from clientes_app.models import Contacto
from ventas_app.models import PedidoDetalle, Pedido
from oportunidades_app.models import Cotizacion
class ServiceCargarDataVenta:
    def Pedido(archivo):
        try:
            campos = {'fecha':str,'fechaentrega': str,'direccion': str,
                      'cotizacion': int,'moneda': str,'RUC_emisor': str ,'cliente': str ,
                      'DOC_cliente': str ,'monto_sin_impuesto': float ,'forma_pago': str,
                      'estado_pedido': str ,'fecha_pago': str,'fecha_despacho': str,
                      'monto_total': float ,'IGV': float ,'codigo_tributo': float,
                      'descuento_adicional': float, 'activo':bool}
            df = pd.read_excel(archivo, sheet_name='Pedido', 
                               usecols=campos.keys(),
                               parse_dates=['fecha', 'fechaentrega','fecha_pago','fecha_despacho'],
                               )
            
            objetos = []

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
            campos = {'pedido':int , 'nombre_producto': str,
                      'precio_unitario': float,'cantidad': int,'descuento':float ,
                      'subtotal': float,'nrolinea': int ,'activo': bool}
            
            df = pd.read_excel(archivo, sheet_name='PedidoDetalle', 
                               usecols=campos.keys())
            
            objetos = []

            for _, row in df.iterrows():
                datos = row.to_dict()
                
                id_pedido = datos.pop('pedido')
                ped = Pedido.objects.get(id=id_pedido)
                
                obj = PedidoDetalle(pedido = ped, **datos)
                objetos.append(obj)
            
            PedidoDetalle.objects.bulk_create(objetos)

        except Exception as e:
            print(e)