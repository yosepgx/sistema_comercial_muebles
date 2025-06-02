from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ventas_app.views import CargarDataPedidosView, PedidoViewSet, PedidoDetalleViewSet, GenerarXMLUBLView

router = DefaultRouter()
router.register(r'pedido', PedidoViewSet)
router.register(r'pedido-detalle', PedidoDetalleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('cargar-data-pedidos/', CargarDataPedidosView.as_view(), name='cargar-data-pedidos'),
    path('generar-xml/<int:pedido_id>/', GenerarXMLUBLView.as_view(), name='generar-xml'),

]

