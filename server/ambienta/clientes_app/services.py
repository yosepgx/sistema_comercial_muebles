import pandas as pd
from clientes_app.models import Contacto, DocumentoID

# contactos -> documentos
class ServiceCargarDataClientes:
    # def Categorias(archivo):
    #     try:
    #         campos = {'descripcion':str, 'activo': bool}
    #         df = pd.read_excel(archivo, sheet_name="CategoriaCliente", 
    #                            usecols=campos.keys(),
    #                            dtype=campos)
            
    #         objetos = [
    #             CategoriaCliente(**row.to_dict())
    #             for _, row in df.iterrows()
    #         ] 

    #         CategoriaCliente.objects.bulk_create(objetos)

    #     except Exception as e:
    #         print(e)

    def Contactos(archivo):
        try:
            campos = {'nombre': str,'correo': str,'telefono': str, 
                      'tipo_interes': str, 'fecha_conversion': str, 
                      'naturaleza': str, 'activo': bool}
            df = pd.read_excel(archivo, sheet_name="Contacto", 
                               usecols=campos.keys(),
                               dtype=campos,
                               )
            
            df['fecha_conversion'] = df['fecha_conversion'].astype(str).str.strip()
            df['fecha_conversion'] = df['fecha_conversion'].replace({'nan': None, 'NaT': None, 'None': None})
            df['fecha_conversion'] = pd.to_datetime(df['fecha_conversion'], errors='coerce')

            objetos = [] 

            for _, row in df.iterrows():
                #cat = CategoriaCliente.objects.get(id=row['categoria'])
                cont = Contacto(
                    nombre = row['nombre'],
                    correo = row['correo'],
                    telefono = row['telefono'],
                    tipo_interes= row['tipo_interes'],
                    fecha_conversion = row['fecha_conversion'].date() if pd.notna(row['fecha_conversion']) else None,
                    naturaleza = row['naturaleza'],
                    #categoria = cat,
                    activo= row['activo'],
                )
                objetos.append(cont)
            
            Contacto.objects.bulk_create(objetos)
        except Exception as e:
            print(e)
        
    def Documentos(archivo):
        try:
            campos = {'tipo': str,'cod_dni': str,'cod_ruc': str,'cod_ce': str,'contacto': str,'activo': bool}
            
            df = pd.read_excel(archivo, sheet_name="DocumentoID", 
                               usecols=campos.keys(),
                               dtype=campos,
                               )
            
            objetos = [] 

            for _, row in df.iterrows():
                cont = Contacto.objects.get(id=row['contacto'])
                doc = DocumentoID(
                    #tipo = row['tipo'],
                    cod_dni = None if pd.isna(row['cod_dni']) else row['cod_dni'],
                    cod_ruc = None if pd.isna(row['cod_ruc']) else row['cod_ruc'],
                    #cod_ce = None if pd.isna(row['cod_ce']) else row['cod_ce'] ,
                    contacto= cont,
                    activo= row['activo'],
                )
                objetos.append(doc)

            DocumentoID.objects.bulk_create(objetos)

        except Exception as e:
            print(e)
