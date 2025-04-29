
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import routers
from . import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('clientes/', include('clientes_app.urls')),
    path('inventario/', include('inventario_app.urls')),
    #path('oportunidades/', include('oportunidades_app.urls')),
    path('predictivo/', include('predictivo.urls')),
    path('usuarios/', include('usuarios_app.urls')),
    path('ventas/', include('ventas_app.urls')),
    
]
