import { customFetch } from "@/components/customFetch";
import { TCliente } from "@/components/types/clienteType";

export async function GetClienteListApi(token:string | null) {
    try {
        const response = await customFetch(token, `clientes/contacto`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            },
            credentials: "include",
        });

        
        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }
        const data = await response.json();
        if (data) {
            return data as TCliente[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de clientes:", error);
        return [];
    }
}

export async function GetClienteDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`clientes/contacto/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TCliente;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de cliente:", error);
        return null;
    }
}
export async function PostClienteAPI(token:string | null, data: TCliente){
    try {
        const response = await customFetch(token,`clientes/contacto/`, {
            
            method: "POST",
            headers:{
                'Content-Type':'application/json' ,
            },
            body: JSON.stringify(data),
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const responseData = await response.json();
        return responseData as TCliente;
        
    } catch (error) {
        console.error("Error al guardar cliente:", error);
        return null;
    }
}

export async function DeleteClienteAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `clientes/contacto/${id}/`, {
            
            method: "DELETE",
            headers:{
                'Content-Type':'application/json' ,
            },
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        return true;
        
    } catch (error) {
        console.error(`Error al borrar cliente ${id}: `, error);
        return false;
    }
}

export async function UpdateClienteAPI(token:string | null, id: number, data: TCliente) {
    try {
      const response = await customFetch(token, `clientes/contacto/${id}/`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
      }
  
      const responseData = await response.json();
      return responseData as TCliente;
  
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      return null;
    }
  }