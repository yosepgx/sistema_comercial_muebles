import pandas as pd
from clientes_app.models import CategoriaCliente, Contacto, DocumentoID, Empresa
class ServiceCargarDataClientes:
    def Categorias(archivo):
        try:
            campos = {'descripcion':str, 'activo': bool}
            df = pd.read_excel(archivo, sheet_name="CategoriaCliente", 
                               usecols=campos.keys(),
                               dtype=campos)
            
            objetos = [
                CategoriaCliente(**row.to_dict())
                for _, row in df.iterrows()
            ] 

            CategoriaCliente.objects.bulk_create(objetos)

        except Exception as e:
            print(e)

    def Contactos(archivo):
        try:
            campos = {'nombre': str,'correo': str,'telefono': str, 
                      'direccion_entrega': str, 'tipo_interes': str, 'fecha_conversion': str, 
                      'naturaleza': str, 'empresa': str, 'categoria': int , 'activo': bool}
            df = pd.read_excel(archivo, sheet_name="Contacto", 
                               usecols=campos.keys(),
                               dtype=campos,

                               )
            df['empresa'] = df['empresa'].where(pd.notna(df['empresa']), None)
            objetos = [] 

            for _, row in df.iterrows():
                fecha_str = row['fecha_conversion']  # Es un string
                fecha_conv = pd.to_datetime(fecha_str, errors='coerce', dayfirst=True).date() if pd.notna(fecha_str) else None
                cat = CategoriaCliente.objects.get(id=row['categoria'])
                cont = Contacto(
                    nombre = row['nombre'],
                    correo = row['correo'],
                    telefono = row['telefono'],
                    direccion_entrega = row['direccion_entrega'],
                    tipo_interes= row['tipo_interes'],
                    fecha_conversion = fecha_conv,
                    naturaleza = row['naturaleza'],
                    empresa = row['empresa'],
                    categoria = cat,
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
                    tipo = row['tipo'],
                    cod_dni = row['cod_dni'],
                    cod_ruc = row['cod_ruc'],
                    cod_ce = row['cod_ce'],
                    contacto= cont,
                    activo= row['activo'],
                )
                objetos.append(doc)

            DocumentoID.objects.bulk_create(objetos)

        except Exception as e:
            print(e)
