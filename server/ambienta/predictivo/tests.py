from django.test import TestCase
from oportunidades_app.services import ServiceCargarDatosOportunidades
from oportunidades_app.models import Oportunidad, CotizacionDetalle, Cotizacion
from ventas_app.services import ServiceCargarDataVenta
from ventas_app.models import Pedido,PedidoDetalle
from django.db import transaction
from clientes_app.services import ServiceCargarDataClientes
from clientes_app.models import Cliente
from inventario_app.services import ServiceCargarDataInventario
from inventario_app.models import CategoriaProducto, Producto
from predictivo.services import ServicePrediccion, ServiceCargarCompras
import pandas as pd
class TestPrediccion(TestCase):
    
    archivo_ventas = "datacargable/DataVenta.xlsx"
    archivo_clientes = "datacargable/DataClientes.xlsx"
    archivo_producto = "datacargable/DataProducto.xlsx"
    archivo_compras = "datacargable/DataCompra.xlsx"
    prediccion = pd.DataFrame()
    requisicion = pd.DataFrame()
    horizonte = 1
    pasado = 36
    def setUp(self):
        #carga de DataProducto        
        ServiceCargarDataInventario.Categorias(self.archivo_producto)
        ServiceCargarDataInventario.Productos(self.archivo_producto)
        ServiceCargarDataInventario.Precios(self.archivo_producto)
        ServiceCargarDataInventario.Almacenes(self.archivo_producto)
        ServiceCargarDataInventario.DataInventario(self.archivo_producto)
        
        #carga de dataCliente
        ServiceCargarDataClientes.Clientes(self.archivo_clientes)
        #ServiceCargarDataClientes.Documentos(self.archivo_clientes)

        #carga de DataOportunidad (Ventas)
        ServiceCargarDatosOportunidades.Oportunidades(self.archivo_ventas)
        ServiceCargarDatosOportunidades.Cotizacion(self.archivo_ventas)
        ServiceCargarDatosOportunidades.CotizacionDetalle(self.archivo_ventas)
        
        #carga de DataVenta
        ServiceCargarDataVenta.Pedido(self.archivo_ventas)
        ServiceCargarDataVenta.PedidoDetalle(self.archivo_ventas)

        #carga de compras
        ServiceCargarCompras.Compras(self.archivo_compras)

        #prediccion
        self.prediccion = ServicePrediccion.predecir_productos(horizonte_meses= self.horizonte, meses_historico= self.pasado)
        if(self.prediccion.empty):
            self.fail("No se genero prediccion")
        

    def testQuery(self):
        self.requisicion = ServicePrediccion.GenerarRequisicion(self.prediccion, self.horizonte, self.pasado)