from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from predictivo.services import ServicePrediccion, ServiceCargarCompras, Compra
import pandas as pd
from django.http import HttpResponse
from rest_framework.parsers import MultiPartParser, FormParser

import io

class GenerarRequisicionesView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            horizonte = request.data.get('horizonte', 1)
            pasado = request.data.get('pasado', 36)
            compras = request.data.get('compras')

            # Generar predicción
            prediccion = ServicePrediccion.predecir_productos(horizonte_meses=horizonte, meses_historico=pasado)
            if prediccion.empty:
                return Response({"error": "No se generó predicción"}, status=status.HTTP_400_BAD_REQUEST)

            
            compras_lista = [Compra(**compra) for compra in compras] if compras else []
            # Generar requisiciones
            requisicion = ServicePrediccion.GenerarRequisicion(prediccion, compras_lista, horizonte, pasado, )

            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="requisiciones.xlsx"'

            # Guardar directamente en el response sin usar ExcelWriter
            requisicion.to_excel(response, index=False, sheet_name='Requisiciones', engine='openpyxl')

            return response
        except Exception as e:
            print("❌ Error en GenerarRequisicionesView:", str(e))  # Mensaje simple
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CargarComprasView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'error': 'No se envió ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        contenido = ServiceCargarCompras.Compras(archivo)
        
        return Response({'mensaje': 'Archivo cargado y contenido guardado en sesión', 'compras': contenido})
        
