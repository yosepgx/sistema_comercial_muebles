import { customFetch } from "@/components/customFetch";
import { TCotizacion } from "@/components/types/cotizacion"; 

export async function GetCotizacionListApi(token:string | null) {
    try {
        const response = await customFetch(token, `oportunidades/cotizacion`, {
            
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
            return data as TCotizacion[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de cotizacion:", error);
        return [];
    }
}

export async function GetCotizacionDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`oportunidades/cotizacion/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TCotizacion;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de cotizacion:", error);
        return null;
    }
}
export async function PostCotizacionAPI(token:string | null, data: TCotizacion){
    try {
        const response = await customFetch(token,`oportunidades/cotizacion/`, {
            
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
        return responseData as TCotizacion;
        
    } catch (error) {
        console.error("Error al guardar cotizacion:", error);
        return null;
    }
}

export async function DeleteCotizacionAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `oportunidades/cotizacion/${id}/`, {
            
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
        console.error(`Error al borrar cotizacion ${id}: `, error);
        return false;
    }
}

export async function UpdateCotizacionAPI(token:string | null, id: number, data: TCotizacion) {
    try {
      const response = await customFetch(token, `oportunidades/cotizacion/${id}/`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();

      if (!response.ok) {
        const mensaje = responseData?.detalle || `Error del servidor: ${response.status}`;
        throw new Error(mensaje);
      }
  
      return responseData as TCotizacion;
  
    } catch (error) {
      console.error("Error al actualizar cotizacion:", error);
      const mensaje = error instanceof Error? error.message : "Ocurrió un error inesperado.";
    alert(mensaje);
    return null;
    }
  }