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
from datetime import datetime, timedelta
from django.utils import timezone
import os
import environ

class Compra:
    def __init__(self, codigo: int, nombre: str, cantidad: int):
        self.codigo = codigo
        self.nombre = nombre
        self.cantidad = cantidad
    

class ServicePrediccion:
    def __init__(self, queryset=None):
        
        self.queryset = queryset or PedidoDetalle.objects.filter(activo=True)

    #def obtener_historico_pedidos(self, meses_historico: int=12) -> pd.DataFrame:
    def obtener_historico_pedidos(self) -> pd.DataFrame:
        
        # Calcular fecha de corte
        #fecha_corte = timezone.now() - timedelta(days=meses_historico * 30)
        
        # Filtrar queryset por fecha
        historico_filtrado = self.queryset.select_related('pedido', 'producto').filter(
            #pedido__fechaentrega__gte=fecha_corte,
            pedido__estado_pedido = Pedido.DESPACHADO,
            pedido__tipo_comprobante__in=[Pedido.TIPOBOLETA, Pedido.TIPOFACTURA],
            producto__es_servicio =  False
        )
        
        # Obtener datos
        historicos = historico_filtrado.values_list(
            'pedido__pk', 
            'pedido__fechaentrega', 
            'pk',
            'producto', 
            'producto__nombre', 
            'cantidad', 
            'subtotal'
        )

        data = pd.DataFrame(list(historicos), columns=[
            'pedido_pk', 'fechaentrega', 'detalle_pk','producto', 'nombre_producto',  'cantidad', 'subtotal'
        ])
        
        data['fechaentrega'] = pd.to_datetime(data['fechaentrega'])
        return data

    def preparar_datos_mensuales(self, data: pd.DataFrame) -> pd.DataFrame:
        
        data['Mes'] = data['fechaentrega'].dt.to_period('M')#e.g 2024/01

        # Obtener todas las combinaciones de meses y productos
        all_months = pd.period_range(data['Mes'].min(), data['Mes'].max(), freq='M')
        all_products = data['producto'].unique()
        
        full_index = pd.MultiIndex.from_product([all_months, all_products], names=['Mes', 'producto'])

        # Agrupar por Mes y Producto
        grouped_data = data.groupby(['Mes', 'producto'])['cantidad'].sum().reset_index()

        # Merge con el índice completo y rellenar los NaN con 0
        full_data = pd.DataFrame(index=full_index).reset_index().merge(grouped_data, on=['Mes', 'producto'], how='left')
        full_data['cantidad'] = full_data['cantidad'].fillna(0)

        # Recuperar nombre_producto
        producto_nombre = data[['producto', 'nombre_producto']].drop_duplicates()
        full_data = full_data.merge(producto_nombre, on='producto', how='left')

        return full_data

    def calcular_indices_estacionales(self, monthly_product_quantities: pd.DataFrame, meses_horizonte: list) -> dict:
        
        def calcular_indice_producto_mes(product: int, mes: str) -> float:
            
            product_data = monthly_product_quantities[monthly_product_quantities['producto'] == product]
            
            # Cálculo del índice estacional considerando todo el histórico
            total_mean = product_data['cantidad'].mean()
            
            # Intentar calcular índice para el mes específico del producto
            mes_producto_mean = product_data[
                product_data['Mes'].dt.strftime('%m') == mes
            ]['cantidad'].mean()
            
            #alisamiento para indices estacionales
            beta = 5

            # Si no hay datos para ese mes, usar el índice global
            if pd.isna(mes_producto_mean) or mes_producto_mean == 0:
                # Usar el promedio de los meses con ese número para todos los productos
                mes_global_mean = monthly_product_quantities[
                    monthly_product_quantities['Mes'].dt.strftime('%m') == mes
                ]['cantidad'].mean()
                
                return (mes_global_mean + beta)/ (monthly_product_quantities.groupby('Mes')['cantidad'].sum().mean() + beta)
            
            # Calcular índice estacional
            return (mes_producto_mean + beta) / (total_mean + beta)
        
        # Calcular índices para cada producto y mes del horizonte
        indices_estacionales = {
            product: {
                mes: calcular_indice_producto_mes(product, mes)
                for mes in meses_horizonte
            }
            for product in monthly_product_quantities['producto'].unique()
        }
        
        return indices_estacionales

    def calcular_factor_crecimiento(self, monthly_product_quantities: pd.DataFrame) -> dict:
        factores = {}
        
        for product in monthly_product_quantities['producto'].unique():
            product_data = monthly_product_quantities[monthly_product_quantities['producto'] == product].copy()
            product_data['año'] = product_data['Mes'].dt.year  
            years = sorted(product_data['año'].unique(), reverse=True)

            if len(years) < 3:
                factores[product] = 1
                continue

            last_year = years[1]  # Año pasado (a-1)
            prev_year = years[2]  # Antepasado (a-2)

            last_year_data = product_data[product_data['año'] == last_year]
            prev_year_data = product_data[product_data['año'] == prev_year]

            #print(last_year_data)
            #print(prev_year_data)

            if not last_year_data.empty and not prev_year_data.empty:
                avg_last_year = last_year_data['cantidad'].sum()/12
                avg_prev_year = prev_year_data['cantidad'].sum()/12
                #usare suavizador laplace(alpha) para reducir el factor. Ademas un acotador
                if avg_last_year > 0 and avg_prev_year > 0:
                    alpha = 10
                    G_i = (avg_last_year + alpha) / (avg_prev_year + alpha)
                    G_i = min(max(G_i, 0.5), 2.0)
                else:
                    G_i = 1
            else:
                G_i = 1

            factores[product] = G_i

        return factores

    def predecir_cantidades(self, monthly_product_quantities: pd.DataFrame, indices_estacionales: dict, meses_historico: int) -> pd.DataFrame:
        
        factores_crecimiento = self.calcular_factor_crecimiento(monthly_product_quantities)
        #predicciones = {}
        predicciones = []
        count=0
        #print(monthly_product_quantities)
        for product in monthly_product_quantities['producto'].unique():
            product_data = monthly_product_quantities[monthly_product_quantities['producto'] == product]
            nombre_producto = product_data['nombre_producto'].iloc[0]
            # Promedio de los últimos x meses -> Moving averages
            promedio_movil = product_data['cantidad'].tail(meses_historico).mean()
            
            # Aplicar factor de crecimiento
            factor_anual = factores_crecimiento.get(product, 1)
            factor_mensual = factor_anual ** (1/12)
            
             # Representación de trazabilidad
            promedio_str = f"{promedio_movil:.2f}"
            factor_str = f"Anual: {factor_anual:.3f}, Mensual: {factor_mensual:.4f}"
            indices_dict = indices_estacionales.get(product, {})
            indices_str = ', '.join(f"{mes}: {round(indice, 2)}" for mes, indice in indices_dict.items())

            # Cálculo totalizado
            total_predicho = 0
            for i, (mes, indice) in enumerate(indices_dict.items()):
                crecimiento_compuesto = factor_mensual ** (i + 1)
                total_predicho += promedio_movil * indice * crecimiento_compuesto

            predicciones.append({
                'nombre_producto': nombre_producto,
                'Producto': product,
                'Cantidad_Predicha': round(total_predicho),
                'Promedio_Movil': promedio_str,
                'Indices_Estacionales': indices_str,
                'Factor_Crecimiento': factor_str
            })

            # if product == 60:
            #     print(product_data['cantidad'].tail(meses_historico))
            #     print("la media es", product_data['cantidad'].tail(meses_historico).mean())
            #     print("indice ", indices_estacionales[product].items())
            #     print("factor ", factor_mensual)

            
        
        # Convertir a DataFrame para mejor visualización
        #df_predicciones = []
        #for producto, predicciones_mes in predicciones.items():
        #    for mes, cantidad in predicciones_mes.items():
        #        df_predicciones.append({
        #            'Producto': producto, 
        #            'Mes': mes, 
        #            'Cantidad_Predicha': round(cantidad)
        #            #'Cantidad_Predicha': cantidad
        #        })

        
        
        #df = pd.DataFrame(df_predicciones)
        df = pd.DataFrame(predicciones)

        #desactivar para mostrar cantidad_predicha para cada mes
        # Totalizar por producto (sumar cantidades)
        #df = df.groupby(['Producto','nombre_producto'], as_index=False)['Cantidad_Predicha'].sum()
        #df.to_excel("C:\\Users\\jhosept\\Documents\\GitHub\\sistema_comercial_muebles\\server\\ambienta\\predictivo\\requisiciones\\prediccion.xlsx")
        return df

    def generar_prediccion(self, horizonte_meses:int =1, meses_historico:int =12) -> pd.DataFrame:
        
        try:
            # Obtener histórico de pedidos
            #data = self.obtener_historico_pedidos(meses_historico)
            data = self.obtener_historico_pedidos()
            
            # Verificar si hay datos suficientes
            if data.empty:
                print(f"No hay datos históricos para los últimos {meses_historico} meses.")
                return pd.DataFrame(columns=['nombre_producto','Producto', 'Mes', 'Cantidad_Predicha'])
                
            
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
            return pd.DataFrame(columns=['nombre_producto','Producto', 'Mes', 'Cantidad_Predicha'])
            

    @classmethod
    def predecir_productos(cls, horizonte_meses:int =1, meses_historico:int =12, queryset=None) ->pd.DataFrame:
        
        servicio = cls(queryset)
        return servicio.generar_prediccion(horizonte_meses, meses_historico)
    


    def GenerarRequisicion(prediccion: pd.DataFrame, compras,horizonte_meses: int = 1, meses_historico: int = 12 ) -> pd.DataFrame:
        
        # Stock actual
        inventarioNow = Inventario.objects.all()
        stock_actual = defaultdict(int)
        
        for item in inventarioNow:
            stock_actual[item.producto.id] += item.cantidad_disponible

        # Pedidos en transito
        compras_actuales = defaultdict(int)
        for compra in compras:
            compras_actuales[compra.codigo] += compra.cantidad
        
        # Calcular la necesidad de reposición
        requisicion = []
        for _, row in prediccion.iterrows():
            nombre_producto = row['nombre_producto']
            producto = row["Producto"]
            cantidad_predicha = row["Cantidad_Predicha"]
            promedio_movil = row["Promedio_Movil"]
            indices_estacionales = row["Indices_Estacionales"]
            factor_crecimiento = row["Factor_Crecimiento"]
            # Obtener stock disponible y pedidos actuales, con valor 0 si no existe
            stock_disponible = stock_actual.get(producto, 0) + compras_actuales.get(producto, 0)
            
            # Calcular cantidad requerida
            cantidad_requerida = max(0, cantidad_predicha - stock_disponible)
            
            if cantidad_requerida > 0:
                requisicion.append({
                        "Codigo de producto": producto,
                        "Nombre de Producto": nombre_producto,
                        "Cantidad Predicha": cantidad_predicha,
                        "Stock Actual": stock_actual.get(producto, 0),
                        "Pedidos en Transito": compras_actuales.get(producto, 0),
                        "Cantidad Recomendada": cantidad_requerida,
                        "Promedio Movil": promedio_movil,
                        "Indices Estacionales": indices_estacionales,
                        "Factor Crecimiento": factor_crecimiento
                    })
        
        df = pd.DataFrame(requisicion)
        
        # nombre = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_ho-{horizonte_meses}_pa-{meses_historico}.xlsx"

        # directorio_base = os.environ.get("PREDICTIVO_PATH", os.path.dirname(os.path.abspath(__file__)))
        # ruta_requisiciones = os.path.join(directorio_base, "requisiciones")
        # os.makedirs(ruta_requisiciones, exist_ok=True)
        # ruta_completa = os.path.join(ruta_requisiciones, nombre)

        # df.to_excel(ruta_completa, index=False)
        
        return df    

class ServiceCargarCompras:
    def Compras(archivo):
        try:
            campos = ['codigo', 'nombre','cantidad']
            df = pd.read_excel(archivo, 
                               usecols=campos,
                               dtype={'codigo':int ,'nombre': str, 'cantidad': int}
                               )
            
            compras = [
                {'codigo': row['codigo'], 'nombre': row['nombre'], 'cantidad': row['cantidad']}
                for _, row in df.iterrows()
            ]
            return compras
            

        except Exception as e:
            print(e)
        
