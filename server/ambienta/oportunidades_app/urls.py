from django.urls import path, include
from .views import CotizacionDetalleViewSet, CotizacionViewSet,OportunidadViewSet, generar_pdf_cotizacion
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
#oportunidad -> cotizacion -> cotizacionDetalle 
router.register(r'oportunidad', OportunidadViewSet)
router.register(r'cotizacion', CotizacionViewSet)
router.register(r'cotizacion-detalle', CotizacionDetalleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('cotizacion/<int:cotizacion_id>/pdf/', generar_pdf_cotizacion, name='generar_pdf_cotizacion'),

]
