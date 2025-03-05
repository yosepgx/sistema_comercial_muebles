from django.shortcuts import render
import pandas as pd
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from io import BytesIO
from ventas_app.models import PedidoDetalle, Pedido
from inventario_app.models import Inventario
from collections import defaultdict
from datetime import datetime

class ServicePrediccion:
    def __init__(self, queryset=None):
        
        self.queryset = queryset or PedidoDetalle.objects.filter(activo=True)

    def obtener_historico_pedidos(self) -> pd.DataFrame:
        
        historicos = self.queryset.select_related('pedido').values_list(
            'pedido__pk', 
            'pedido__fechaentrega', 
            'pk', 
            'nombre_producto', 
            'cantidad', 
            'subtotal'
        )

        data = pd.DataFrame(list(historicos), columns=[
            'pedido_pk', 'fechaentrega', 'detalle_pk', 'producto', 'cantidad', 'subtotal'
        ])
        
        data['fechaentrega'] = pd.to_datetime(data['fechaentrega'])
        return data

    def preparar_datos_mensuales(self, data: pd.DataFrame) -> pd.DataFrame:
        
        data['Mes'] = data['fechaentrega'].dt.to_period('M')
        return data.groupby(['Mes', 'producto'])['cantidad'].sum().reset_index()

    def calcular_indices_estacionales(self, monthly_product_quantities: pd.DataFrame, meses_horizonte: list) -> dict:
        
        def calcular_indice_producto_mes(product: str, mes: str) -> float:
            
            product_data = monthly_product_quantities[monthly_product_quantities['producto'] == product]
            
            # Cálculo del índice estacional considerando todo el histórico
            total_mean = product_data['cantidad'].mean()
            
            # Intentar calcular índice para el mes específico del producto
            mes_producto_mean = product_data[
                product_data['Mes'].dt.strftime('%m') == mes
            ]['cantidad'].mean()
            
            # Si no hay datos para ese mes, usar el índice global
            if pd.isna(mes_producto_mean) or mes_producto_mean == 0:
                # Usar el promedio de los meses con ese número para todos los productos
                mes_global_mean = monthly_product_quantities[
                    monthly_product_quantities['Mes'].dt.strftime('%m') == mes
                ]['cantidad'].mean()
                
                return mes_global_mean / monthly_product_quantities.groupby('Mes')['cantidad'].sum().mean()
            
            # Calcular índice estacional
            return mes_producto_mean / total_mean
        
        # Calcular índices para cada producto y mes del horizonte
        indices_estacionales = {
            product: {
                mes: calcular_indice_producto_mes(product, mes)
                for mes in meses_horizonte
            }
            for product in monthly_product_quantities['producto'].unique()
        }
        
        return indices_estacionales

    def predecir_cantidades(self, monthly_product_quantities: pd.DataFrame, indices_estacionales: dict, meses_historico: int) -> pd.DataFrame:
        
        predicciones = {}
        
        for product in monthly_product_quantities['producto'].unique():
            product_data = monthly_product_quantities[monthly_product_quantities['producto'] == product]
            
            # Promedio de las últimas X cantidades
            average_quantities = product_data['cantidad'].tail(meses_historico).mean()
            
            # Predecir para cada mes del horizonte
            predicciones_producto = {
                mes: average_quantities * indice 
                for mes, indice in indices_estacionales[product].items()
            }
            
            predicciones[product] = predicciones_producto
        
        # Convertir a DataFrame para mejor visualización
        df_predicciones = []
        for producto, predicciones_mes in predicciones.items():
            for mes, cantidad in predicciones_mes.items():
                df_predicciones.append({
                    'Producto': producto, 
                    'Mes': mes, 
                    'Cantidad_Predicha': cantidad
                })
        
        return pd.DataFrame(df_predicciones)

    def generar_prediccion(self, horizonte_meses:int =3, meses_historico:int = 6) -> pd.DataFrame:
        
        try:
            # Obtener histórico de pedidos
            data = self.obtener_historico_pedidos()
            
            # Preparar datos mensuales
            monthly_product_quantities = self.preparar_datos_mensuales(data)
            
            # Obtener último mes y calcular meses del horizonte
            last_month = monthly_product_quantities['Mes'].iloc[-1]
            
            # Generar lista de meses del horizonte
            meses_horizonte = [
                (last_month + i).strftime('%m') 
                for i in range(1, horizonte_meses + 1)
            ]
            
            # Calcular índices estacionales
            indices_estacionales = self.calcular_indices_estacionales(
                monthly_product_quantities, 
                meses_horizonte
            )
            
            # Predecir cantidades
            predicciones = self.predecir_cantidades(
                monthly_product_quantities, 
                indices_estacionales,
                meses_historico
            )
            
            return predicciones
        
        except Exception as e:
            # Manejo de errores
            print(f"Error en generación de predicción: {e}")
            return pd.DataFrame(columns=['Producto', 'Mes', 'Cantidad_Predicha'])

    @classmethod
    def predecir_productos(cls, horizonte_meses:int =1, meses_historico:int =6 , queryset=None) -> pd.DataFrame:
        
        servicio = cls(queryset)
        return servicio.generar_prediccion(horizonte_meses, meses_historico)
    
    def GenerarRequisicion(prediccion: pd.DataFrame, horizonte_meses: int, meses_historico:int ) -> pd.DataFrame:
        #stock actual
        inventarioNow = Inventario.objects.all()
        stock_actual = defaultdict(int)
        for item in inventarioNow:
            stock_actual[item.producto.id] += item.cantidad

        #Pedidos actuales
        pedidosNow = Pedido.objects.filter(activo=True)
        pedidos_actuales = defaultdict(int)
        for pedido in pedidosNow:
            for detalle in pedido.detalles.all():
                pedidos_actuales[detalle.cod_producto] += detalle.cantidad
        
        #restar al stock actual la prediccion y los pedidos actuales
        # Calcular la necesidad de reposición
        requisicion = []
        for _, row in prediccion.iterrows():
            producto = row["Product"]
            cantidad_predicha = row["Quantity"]
            stock_disponible = stock_actual.get(producto, 0) - pedidos_actuales.get(producto, 0)
            cantidad_requerida = max(0, cantidad_predicha - stock_disponible)
            
            if cantidad_requerida > 0:
                requisicion.append({"Producto": producto, "Cantidad_Requerida": cantidad_requerida})
        
            nombre = datetime.now().strftime("%Y%m%d_%H%M%S")
            nombre += f':ho-{horizonte_meses}'
            nombre += f':pa-{meses_historico}'
            
            df = pd.DataFrame(requisicion)
            df.to_excel("C:\\Users\\jhosept\\Documents\\GitHub\\sistema_comercial_muebles\\server\\ambienta\\predictivo\\requisiciones\\requisicion.xlsx", index=False)

            return df

        
        
