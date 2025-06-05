import { customFetch } from "@/components/customFetch";
import { cotizacion, cotizaciones, TCotizacion } from "@/components/types/cotizacion"; 


export const handleDownload = async (token:string | null,cotizacionId: number) => {
  try {
    const res = await customFetch(token, `oportunidades/cotizacion/${cotizacionId}/pdf/`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error("Error al descargar PDF");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank'); // O puedes usar un <a download> si prefieres

  } catch (error) {
    console.error("Fallo al descargar el PDF:", error);
  }
};

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
        const parsed = cotizaciones.safeParse(data);
        if (!parsed.success) {
        console.error("Error de validación en listado de cotización:", parsed.error);
        return [];
        }

        return parsed.data as TCotizacion[];
        
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
        const parsed = cotizacion.safeParse(data);
        if (!parsed.success) {
        console.error("Error de validación en cotización:", parsed.error);
        return null;
        }
        return parsed.data as TCotizacion;
        
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
        const parsed = cotizacion.safeParse(responseData);
        if (!parsed.success) {
        console.error("Error de validación en cotización:", parsed.error);
        return null;
        }
        return parsed.data as TCotizacion;
        
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
        const mensaje = responseData?.detalle;
        if (mensaje) {
            throw new Error(mensaje);
        } else {
            console.warn("Error no relevante para el vendedor:", responseData);
            return null; 
        }
      }
  
      return responseData as TCotizacion;
  
    } catch (error) {
      console.error("Error al actualizar cotizacion:", error);
      const mensaje = error instanceof Error? error.message : "Ocurrió un error inesperado.";
      alert(mensaje);
      return null;
    }
  }