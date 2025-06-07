from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventario_app import views

#categoria -> producto -> almacen -> invenatario
router = DefaultRouter()
router.register(r'categoria', views.CategoriaProductoViewSet)
router.register(r'producto', views.ProductoViewSet)
router.register(r'almacen', views.AlmacenViewSet)
router.register(r'inventario', views.InventarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('cargar-inventario/', views.CargarInventariosView.as_view(), name='cargar-inventario'),
    path('descargar-productos/', views.DescargarProductos.as_view(), name='descargar-productos'),
    path('descargar-inventario/', views.DescargarStock.as_view(), name='descargar-inventario'),
]

