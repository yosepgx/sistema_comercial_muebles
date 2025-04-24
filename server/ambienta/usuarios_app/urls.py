from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventario_app import views

#categoria -> producto -> almacen -> invenatario
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]
