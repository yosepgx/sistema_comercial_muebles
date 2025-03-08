from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from predictivo.services import ServicePrediccion
import pandas as pd
from django.http import HttpResponse
import io
class GenerarRequisicionesView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            horizonte = request.data.get('horizonte', 1)
            pasado = request.data.get('pasado', 36)

            # Generar predicción
            prediccion = ServicePrediccion.predecir_productos(horizonte_meses=horizonte, meses_historico=pasado)
            if prediccion.empty:
                return Response({"error": "No se generó predicción"}, status=status.HTTP_400_BAD_REQUEST)

            # Generar requisiciones
            requisicion = ServicePrediccion.GenerarRequisicion(prediccion, horizonte, pasado)

            # Guardar en un archivo Excel en memoria
            #output = io.BytesIO()
            #with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            #    requisicion.to_excel(writer, index=False, sheet_name='Requisiciones')
            
            #output.seek(0)  # Volver al inicio del archivo

            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="requisiciones.xlsx"'

            # Guardar directamente en el response sin usar ExcelWriter
            requisicion.to_excel(response, index=False, sheet_name='Requisiciones', engine='openpyxl')

            return response
        except Exception as e:
            print("❌ Error en GenerarRequisicionesView:", str(e))  # Mensaje simple
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
