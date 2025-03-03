from django.shortcuts import render
import pandas as pd
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from io import BytesIO

@api_view(["POST"])
def cargar_historico (request):
    try:
        archivo = request.FILES['archivo']
        
        if not archivo.name.endswith(".csv"):
            return Response({"ERROR" : "el archivo no cumple ningun formato aceptado"}, status=400)
        
        data = pd.read_csv(archivo, delimiter=';', parse_dates=['Fecha'], dayfirst=True)

        # Sumarizar por mes y producto
        data['Mes'] = data['Fecha'].dt.to_period('M')  # formato fecha hasta mes e.g 2024/01
        monthly_product_quantities = data.groupby(['Mes', 'Producto'])['cantidad'].sum().reset_index()

        # Filtrar data de ultimo año (seasonal index)
        last_year = monthly_product_quantities['Mes'].dt.year.max()
        last_year_data = monthly_product_quantities[monthly_product_quantities['Mes'].dt.year == last_year]

        # siguiente mes sera el ultimo mes del historico + 1 
        last_month = monthly_product_quantities['Mes'].iloc[-1]  
        next_month = (last_month + 1).strftime('%m')  

        print(next_month, type(next_month))
        # diccionario de prediccion para cada producto para el mes siguiente (mes siguiente = ultimo mes + 1 )
        forecasts = {}
        for product in monthly_product_quantities['Producto'].unique():
            # solo las filas del producto
            product_data_by_month = monthly_product_quantities[monthly_product_quantities['Producto'] == product]
            print(product_data_by_month)
            # solo las filas del producto del ultimo año
            last_year_product_data = last_year_data[last_year_data['Producto'] == product]
            
            seasonal_index = product_data_by_month[product_data_by_month['Mes'].dt.strftime('%m') == next_month]['cantidad'].mean()/ product_data_by_month['cantidad'].mean()
            #print(product_data['cantidad'].mean())
            #print(seasonal_index)
            if not pd.isna(seasonal_index):
                next_month_seasonal_index = seasonal_index
            else :
                next_month_seasonal_index = monthly_product_quantities[monthly_product_quantities['Mes'].dt.strftime('%m') == next_month]['cantidad'].sum()/ data.groupby(['Mes'])['cantidad'].sum().mean()
                #print("default", next_month_seasonal_index)
            # sacar el indice estacional para el mes futuro
            
            
            average_quantities_last_months = product_data_by_month['cantidad'].tail(6).mean()
            forecasted_quantities = average_quantities_last_months * next_month_seasonal_index
            forecasted_quantities = forecasted_quantities
            forecasts[product] = forecasted_quantities

        sorted_forecasts = sorted(forecasts.items(), key=lambda x: x[1], reverse=True)
        df = pd.DataFrame(sorted_forecasts, columns=["Product", "Quantity"])

        print("Prediccion de productos para el siguiente mes:")
        for product, quantity in sorted_forecasts:
            print(f"- {product}: {quantity}")

         # Create an Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="Forecasts")

        # Set the response as an Excel file
        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="requisiciones.xlsx"'

        return response
    except Exception as e:
        return Response({"ERROR": str(e)}, status=500)
