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
      if (typeof mensaje === "string" && mensaje.trim() !== "") {
        alert(mensaje);
      } else {
        console.error("Error sin detalle para mostrar:", responseData);
      }
      return null;
    }
  
      return responseData as TCotizacion;
  
    } catch (error) {
      console.error("Error al actualizar cotizacion:", error);
      return null;
    }
  }

export const descargarCotizacionesAPI = async (token: string | null,fechaInicio: string, fechaFin: string) => {
    try {
      const response = await customFetch(token,'oportunidades/descargar-cotizaciones/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Error al generar el archivo.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cotizaciones.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al intentar descargar el archivo.');
      console.error(error);
    }
};
