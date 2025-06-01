import { customFetch } from "@/components/customFetch";
import { TCotizacionDetalle } from "@/components/types/cotizacion"; 

export async function GetCotizacionLineaListApi(token:string | null, idcotizacion: number) {
    try {
        const response = await customFetch(token, `oportunidades/cotizacion-detalle/?cotizacion=${idcotizacion}`, {
            
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
            return data as TCotizacionDetalle[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de cotizacion-detalle:", error);
        return [];
    }
}

export async function GetCotizacionLineaDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`oportunidades/cotizacion-detalle/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TCotizacionDetalle;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de cotizacion-detalle:", error);
        return null;
    }
}
export async function PostCotizacionLineaAPI(token:string | null, data: TCotizacionDetalle){
    try {
        const response = await customFetch(token,`oportunidades/cotizacion-detalle/`, {
            
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
        return responseData as TCotizacionDetalle;
        
    } catch (error) {
        console.error("Error al guardar cotizacion-detalle:", error);
        return null;
    }
}

export async function DeleteCotizacionLineaAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `oportunidades/cotizacion-detalle/${id}/`, {
            
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
        console.error(`Error al borrar cotizacion-detalle ${id}: `, error);
        return false;
    }
}

export async function UpdateCotizacionLineaAPI(token:string | null, id: number, data: TCotizacionDetalle) {
    try {
      const response = await customFetch(token, `oportunidades/cotizacion-detalle/${id}/`, {
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
      return responseData as TCotizacionDetalle;
  
    } catch (error) {
      console.error("Error al actualizar cotizacion-detalle:", error);
      return null;
    }
  }