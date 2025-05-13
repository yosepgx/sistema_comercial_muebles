import { customFetch } from "@/components/customFetch";
import { TCategoria } from "../types/productoTypes";

export async function GetCategoriaListApi(token:string | null) {
    try {
        const response = await customFetch(token, `inventario/categoria`, {
            
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
            return data as TCategoria[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de categorias de producto:", error);
        return [];
    }
}

export async function GetCategoriaDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`inventario/categoria/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TCategoria;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de categorias de producto:", error);
        return null;
    }
}
export async function PostProductoAPI(token:string | null, data: TCategoria){
    try {
        const response = await customFetch(token,`inventario/categoria`, {
            
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
        return responseData as TCategoria;
        
    } catch (error) {
        console.error("Error al guardar detalle de categoria de producto:", error);
        return null;
    }
}

export async function DeleteProductoAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `inventario/categoria/${id}`, {
            
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
        console.error(`Error al borrar categoria de producto ${id}: `, error);
        return false;
    }
}

export async function UpdateProductoAPI(token:string | null, id: number, data: TCategoria) {
    try {
      const response = await customFetch(token, `inventario/categoria/${id}`, {
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
      return responseData as TCategoria;
  
    } catch (error) {
      console.error("Error al actualizar categoria de producto:", error);
      return null;
    }
  }