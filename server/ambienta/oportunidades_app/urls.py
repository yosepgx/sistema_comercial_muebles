from django.urls import path, include
from .views import CotizacionDetalleViewSet, CotizacionViewSet,OportunidadViewSet, GenerarPDFCotizacionView, DescargarCotizaciones
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
#oportunidad -> cotizacion -> cotizacionDetalle 
router.register(r'oportunidad', OportunidadViewSet)
router.register(r'cotizacion', CotizacionViewSet)
router.register(r'cotizacion-detalle', CotizacionDetalleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('cotizacion/<int:cotizacion_id>/pdf/', GenerarPDFCotizacionView.as_view(), name='generar_pdf_cotizacion'),
    path('descargar-cotizaciones/', DescargarCotizaciones.as_view(), name='descargar-cotizaciones'),
]
