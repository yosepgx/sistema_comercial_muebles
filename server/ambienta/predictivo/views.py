from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from predictivo.services import ServicePrediccion
class PredictivoView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            prediccion = ServicePrediccion.GenerarPrediccion()
            ServicePrediccion.GenerarRequisicion(prediccion)
        except Exception as e:
            print(e)