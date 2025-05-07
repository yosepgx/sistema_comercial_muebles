from django.test import TestCase
from oportunidades_app.services import ServiceCargarDatosOportunidades
from oportunidades_app.models import Oportunidad, CotizacionDetalle, Cotizacion
from ventas_app.services import ServiceCargarDataVenta
from ventas_app.models import Pedido,PedidoDetalle
from django.db import transaction
from clientes_app.services import ServiceCargarDataClientes
from clientes_app.models import Contacto, DocumentoID
from inventario_app.services import ServiceCargarDataInventario
from inventario_app.models import CategoriaProducto, Producto
class CargarDataTest(TestCase):
    archivo_ventas = "datacargable/DataVenta.xlsx"
    archivo_clientes = "datacargable/DataClientes.xlsx"
    archivo_producto = "datacargable/DataProducto.xlsx"

    def setUp(self):
        
        
        ServiceCargarDataClientes.Contactos(self.archivo_clientes)
        if(Contacto.objects.count()<=0):
            self.fail("No se cargo ningun contacto")
        
        ServiceCargarDataClientes.Documentos(self.archivo_clientes)
        if(DocumentoID.objects.count()<=0):
            self.fail("No se cargo ningun documento de identidad")

        ServiceCargarDatosOportunidades.Oportunidades(self.archivo_ventas)
        if(Oportunidad.objects.count()<=0):
            self.fail("No se cargo ninguna oportunidad de venta")

        ServiceCargarDatosOportunidades.Cotizacion(self.archivo_ventas)
        if(Cotizacion.objects.count()<=0):
            self.fail("No se cargo ninguna cotizacion")
        
        ServiceCargarDataInventario.Categorias(self.archivo_producto)
        if(CategoriaProducto.objects.count()<=0):
            self.fail("No se cargo ninguna categoria")

        ServiceCargarDataInventario.Productos(self.archivo_producto)
        if(Producto.objects.count()<=0):
            self.fail("No se cargo ningun producto")

        ServiceCargarDatosOportunidades.CotizacionDetalle(self.archivo_ventas)
        if(CotizacionDetalle.objects.count()<=0):
            self.fail("No se cargo ninguna linea de cotizacion")

        ServiceCargarDataVenta.Pedido(self.archivo_ventas)
        if(Pedido.objects.count()<=0):
            self.fail("No se cargo ningun pedido")

    def test_cargar_data_LineaPedido(self):
        ServiceCargarDataVenta.PedidoDetalle(self.archivo_ventas)
        self.assertGreater(PedidoDetalle.objects.count(),0,"No se cargo ninguna linea de pedido")
