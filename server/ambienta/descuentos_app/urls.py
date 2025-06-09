# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReglaDescuentoViewSet, calcular_descuentos_linea

router = DefaultRouter()
router.register(r'regla-descuento', ReglaDescuentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('calcular_descuentos_linea/', calcular_descuentos_linea)
]
