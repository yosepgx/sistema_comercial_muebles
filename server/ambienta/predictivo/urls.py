from django.urls import path
from .views import GenerarRequisicionesView,CargarComprasView

urlpatterns = [
    path('generar-requisiciones/', GenerarRequisicionesView.as_view(), name='generar-requisiciones'),
    path('cargar-compras/', CargarComprasView.as_view(), name='cargar-compras')
]