from django.urls import path, include
from rest_framework.routers import DefaultRouter
from clientes_app import views

router = DefaultRouter()
#router.register(r'categoria', views.CategoriaProductoViewSet)
#router.register(r'documento', views.DocumentoIDViewSet)
router.register(r'contacto', views.ContactoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('cargar-data-clientes/', views.CargarDataClienteView.as_view(), name='cargar-data-clientes'),
]