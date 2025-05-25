import { customFetch } from "@/components/customFetch"

export interface Inventario {
    id: number
    cantidad_disponible: string
    cantidad_comprometida: string
    producto: number
    almacen: string
  }

export async function GetInventarioListApi(token:string | null) {
    try {
        const response = await customFetch(token, `inventario/inventario`, {
            
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
            return data as Inventario[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos del inventario:", error);
        return [];
    }
}

export async function GetInventarioDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`inventario/inventario/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as Inventario;
        
    } catch (error) {
        console.error("Error al obtener datos de registro de inventario:", error);
        return null;
    }
}
export async function PostInventarioAPI(token:string | null, data: Inventario){
    try {
        const response = await customFetch(token,`inventario/inventario/`, {
            
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
        return responseData as Inventario;
        
    } catch (error) {
        console.error("Error al guardar registro de inventario:", error);
        return null;
    }
}

export async function DeleteInventarioAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `inventario/inventario/${id}/`, {
            
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
        console.error("Error al borrar registro de inventario:", error);
        return false;
    }
}

export async function UpdateInventarioAPI(token:string | null, id: number, data: Inventario) {
    try {
      const response = await customFetch(token, `inventario/inventario/${id}/`, {
        
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
      return responseData as Inventario;
  
    } catch (error) {
      console.error("Error al actualizar registro de inventario:", error);
      return null;
    }
  }