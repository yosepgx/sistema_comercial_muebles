from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ventas_app import views

router = DefaultRouter()
#router.register(r'categoria', views.CategoriaProductoViewSet)

urlpatterns = [
    #path('', include(router.urls)),
    path('cargar-data-pedidos/', views.CargarDataPedidosView.as_view(), name='cargar-data-pedidos'),
]

