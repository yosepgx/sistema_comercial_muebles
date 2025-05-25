import { customFetch } from "@/components/customFetch";
import { TProducto } from "@/app/inventario/producto/types/productoTypes"; 

export async function GetProductoListApi(token:string | null) {
    try {
        const response = await customFetch(token, `inventario/producto`, {
            
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
            return data as TProducto[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de productos:", error);
        return [];
    }
}

export async function GetProductoDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`inventario/producto/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TProducto;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de producto:", error);
        return null;
    }
}
export async function PostProductoAPI(token:string | null, data: TProducto){
    try {
        const response = await customFetch(token,`inventario/producto/`, {
            
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
        return responseData as TProducto;
        
    } catch (error) {
        console.error("Error al guardar detalle de producto:", error);
        return null;
    }
}

export async function DeleteProductoAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `inventario/producto/${id}/`, {
            
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
        console.error(`Error al borrar registro de producto ${id}: `, error);
        return false;
    }
}

export async function UpdateProductoAPI(token:string | null, id: number, data: TProducto) {
    try {
      const response = await customFetch(token, `inventario/producto/${id}/`, {
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
      return responseData as TProducto;
  
    } catch (error) {
      console.error("Error al actualizar registro de inventario:", error);
      return null;
    }
  }