import os
import pandas as pd
from django.core.management.base import BaseCommand
from clientes_app.services import ServiceCargarDataClientes
from oportunidades_app.services import ServiceCargarDatosOportunidades
from ventas_app.services import ServiceCargarDataVenta
from inventario_app.services import ServiceCargarDataInventario
from predictivo.services import ServicePrediccion


class Command(BaseCommand):
    help = "Carga datos masivos desde archivos Excel en la base de datos"

    def add_arguments(self, parser):
        parser.add_argument("--ventas", type=str, help="Ruta del archivo de ventas")
        parser.add_argument("--clientes", type=str, help="Ruta del archivo de clientes")
        parser.add_argument("--productos", type=str, help="Ruta del archivo de productos")

    def handle(self, *args, **kwargs):
        archivo_ventas = kwargs["ventas"]
        archivo_clientes = kwargs["clientes"]
        archivo_productos = kwargs["productos"]

        # Validar que los archivos existen
        for archivo in [archivo_ventas, archivo_clientes, archivo_productos]:
            if archivo and not os.path.exists(archivo):
                self.stdout.write(self.style.ERROR(f"❌ El archivo '{archivo}' no existe."))
                return

        try:
            self.stdout.write(self.style.NOTICE("📦 Cargando datos de productos..."))
            ServiceCargarDataInventario.Categorias(archivo_productos)
            ServiceCargarDataInventario.Productos(archivo_productos)
            ServiceCargarDataInventario.Precios(archivo_productos)
            ServiceCargarDataInventario.Almacenes(archivo_productos)
            ServiceCargarDataInventario.DataInventario(archivo_productos)
            self.stdout.write(self.style.SUCCESS("✅ Datos de productos cargados."))

            self.stdout.write(self.style.NOTICE("👥 Cargando datos de clientes..."))
            ServiceCargarDataClientes.Clientes(archivo_clientes)
            #ServiceCargarDataClientes.Documentos(archivo_clientes)
            self.stdout.write(self.style.SUCCESS("✅ Datos de clientes cargados."))

            self.stdout.write(self.style.NOTICE("💼 Cargando datos de oportunidades..."))
            ServiceCargarDatosOportunidades.Oportunidades(archivo_ventas)
            ServiceCargarDatosOportunidades.Cotizacion(archivo_ventas)
            ServiceCargarDatosOportunidades.CotizacionDetalle(archivo_ventas)
            self.stdout.write(self.style.SUCCESS("✅ Datos de oportunidades cargados."))

            self.stdout.write(self.style.NOTICE("🛒 Cargando datos de ventas..."))
            ServiceCargarDataVenta.Pedido(archivo_ventas)
            ServiceCargarDataVenta.PedidoDetalle(archivo_ventas)
            self.stdout.write(self.style.SUCCESS("✅ Datos de ventas cargados."))

            self.stdout.write(self.style.SUCCESS("🎉 ¡Carga de datos completada con éxito!"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error al cargar datos: {e}"))
