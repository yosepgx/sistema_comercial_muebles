from django.urls import path
from .views import GenerarRequisicionesView

urlpatterns = [
    path('generar-requisiciones/', GenerarRequisicionesView.as_view(), name='generar-requisiciones'),
]