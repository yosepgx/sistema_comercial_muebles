from django.test import TestCase
from inventario_app.services import ServiceCargarDataInventario
from inventario_app.models import Producto, CategoriaProducto, Almacen, Inventario
from django.db import transaction

class CargarDataTest(TestCase):
    archivo_excel = "datacargable/DataProducto.xlsx"

    def setUp(self):
        ServiceCargarDataInventario.Categorias(self.archivo_excel)
        if(CategoriaProducto.objects.count()<=0):
            self.fail("No se cargo ninguna categoria")

        ServiceCargarDataInventario.Productos(self.archivo_excel)
        if(Producto.objects.count()<=0):
            self.fail("No se cargo ningun producto")

        ServiceCargarDataInventario.Almacenes(self.archivo_excel)
        if(Almacen.objects.count()<=0):
            self.fail("No se cargo almacenes")
        

    def test_cargar_data_inventario(self):
        ServiceCargarDataInventario.DataInventario(self.archivo_excel)
        self.assertGreater(Inventario.objects.count(),0,"No se cargo el inventario")
