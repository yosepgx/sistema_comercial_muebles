"""
URL configuration for ambienta project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

urlpatterns = [
    path('admin/', admin.site.urls),
    #path('clientes/', include('clientes_app.urls')),
    #path('inventario/', include('inventario_app.urls')),
    #path('oportunidades/', include('oportunidades_app.urls')),
    path('predictivo/', include('predictivo.urls')),
    #path('usuarios/', include('usuarios_app.urls')),
    #path('ventas/', include('ventas_app.urls')),

]
