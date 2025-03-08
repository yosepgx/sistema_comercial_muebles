from inventario_app.models import Producto,Almacen,CategoriaProducto,Inventario
import pandas as pd
from django.db import IntegrityError

#categoria -> producto -> almacen -> inventario
class ServiceCargarDataInventario:
    def Categorias(archivo):
        try:
            df = pd.read_excel(archivo, sheet_name="Categoria", 
                               names=["descripcion", "activo"], 
                               usecols=["descripcion", "activo"],
                               dtype={"descripcion": str, "activo": bool})
            
            categorias = [
                CategoriaProducto(descripcion=row["descripcion"], activo=row["activo"])
                for _, row in df.iterrows()
            ]

            CategoriaProducto.objects.bulk_create(categorias)

        except Exception as e:
            print(e)

    def Productos(archivo):
        try:
            campos = ['nombre', 'umedida_sunat','descripcion', 'precio', 'categoria','igv','afecto_igv','codigo_afecion_igv','activo']
            df = pd.read_excel(archivo, sheet_name="Producto", 
                               usecols=campos,
                               dtype={'nombre': str, 'umedida_sunat': str,'descripcion': str, 'precio': float, 'categoria': str,
                                      'igv': float,'afecto_igv': bool,'codigo_afecion_igv': str,'activo': bool},
                               na_values= 'null')
            
            productos = []
            for _, row in df.iterrows():
                try:
                    # Buscar la categoría por ID (si en el Excel tienes el ID)
                    categoria = CategoriaProducto.objects.get(id=int(row['categoria']))
                except (CategoriaProducto.DoesNotExist, ValueError):
                    print(f"Advertencia: No se encontró la categoría con ID {row['categoria']}. Se cancela")

                    return

                producto = Producto(
                    nombre=row['nombre'],
                    umedida_sunat=row['umedida_sunat'],
                    descripcion= None if pd.isna(row['descripcion']) else row['descripcion'],
                    precio=row['precio'],
                    categoria=categoria,  
                    igv=row['igv'],
                    afecto_igv=row['afecto_igv'],
                    codigo_afecion_igv=row['codigo_afecion_igv'],
                    activo=row['activo']
                )
                productos.append(producto)

            Producto.objects.bulk_create(productos)

        except Exception as e:
            print(e)

    def Almacenes(archivo):
        try:
            campos = ["nombre","tipo", "activo"]
            df = pd.read_excel(archivo, sheet_name="Almacen", 
                               usecols=campos,
                               dtype={"nombre":str ,"tipo":str , "activo": bool})
            
            objetos = [
                Almacen(**row.to_dict())
                for _, row in df.iterrows()
            ]

            Almacen.objects.bulk_create(objetos)

        except Exception as e:
            print(e)
    
    def DataInventario(archivo):
        try:
            campos = ["producto", "cantidad", "almacen"]
            df = pd.read_excel(archivo, sheet_name="Inventario", 
                               usecols=campos,
                               dtype={"producto": int, "cantidad":int, "almacen":int})
            
            objetos = []
            for _, row in df.iterrows():
                try:
                    alm = Almacen.objects.get(id=int(row['almacen']))
                    prod = Producto.objects.get(id=int(row['producto']))
                except (Almacen.DoesNotExist, ValueError):
                    print(f"no hay almacen con ID{row['almacen']}. Se cancela la carga")
                    return
                except (Producto.DoesNotExist, ValueError):
                    print(f"no hay producto con ID{row['producto']}. Se cancela la carga")
                    return
                
                inv = Inventario(
                    producto =prod,
                    cantidad = row['cantidad'],
                    almacen = alm,
                )
                objetos.append(inv)

            Inventario.objects.bulk_create(objetos)
            #for obj in objetos:
            #    print(obj,"\n")
            #    obj.save()

        except Exception as e:
            print(e)
