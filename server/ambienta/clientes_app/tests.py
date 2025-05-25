from django.test import TestCase
from clientes_app.services import ServiceCargarDataClientes
from clientes_app.models import Contacto

class CargarDataTest(TestCase):
    archivo_excel = "datacargable/DataClientes.xlsx"

    def setUp(self):
        

        ServiceCargarDataClientes.Contactos(self.archivo_excel)
        if(Contacto.objects.count()<=0):
            self.fail("No se cargo ningun contacto")


    #def test_cargar_data_documentos(self):
        #ServiceCargarDataClientes.Documentos(self.archivo_excel)
        #self.assertGreater(DocumentoID.objects.count(),0,"No se cargo documentos de identidad")
