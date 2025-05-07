import pandas as pd
from clientes_app.models import Contacto
from ventas_app.models import PedidoDetalle, Pedido
from oportunidades_app.models import Cotizacion
from inventario_app.models import Producto

#Pedido -> PedidoDetalle
class ServiceCargarDataVenta:
    def Pedido(archivo):
        try:
            campos = {'fecha':str,'fechaentrega': str,'direccion': str,
                      'cotizacion': int,'moneda': str,'monto_sin_impuesto': float ,
                      'estado_pedido': str ,'fecha_pago': str,
                      'monto_total': float ,'monto_igv': float ,'codigo_tributo': int,
                      'observaciones': str ,
                      'descuento_adicional': float, 'activo':bool}
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
            campos = {'pedido':int , 'producto':int, 'cantidad': int,'descuento':float ,
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