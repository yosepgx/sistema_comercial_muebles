from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ventas_app.views import CargarDataPedidosView, PedidoViewSet, PedidoDetalleViewSet, GenerarXMLUBLView, DescargarPedidos, GenerarPDFGuiaRemisionView
from ventas_app.viewsNotas import NotaViewSet, GenerarXMLNotaView
router = DefaultRouter()
router.register(r'pedido', PedidoViewSet)
router.register(r'pedido-detalle', PedidoDetalleViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('cargar-data-pedidos/', CargarDataPedidosView.as_view(), name='cargar-data-pedidos'),
    path('generar-xml/<int:pedido_id>/', GenerarXMLUBLView.as_view(), name='generar-xml'),
    path('generar-xml-nota/<int:pedido_id>/', GenerarXMLNotaView.as_view(), name='generar-xml-nota'),
    path('descargar-pedidos/', DescargarPedidos.as_view(), name='descargar-pedidos'),
    path('generar-guia/<int:pedido_id>/', GenerarPDFGuiaRemisionView.as_view(), name='generar-guia'),
    path('nota-creacion/',NotaViewSet.as_view(), name='nota-creacion')

]

# POST /api/generar-pdf-guia/42/
# {
#   "direccion_partida": "Av. Industrial 123"
# }
