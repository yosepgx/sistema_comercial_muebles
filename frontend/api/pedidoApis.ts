import { customFetch } from "@/components/customFetch";
import { TPedido } from "@/components/types/pedido"; 

export const GetXMLFile = async (token: string | null, idpedido: number) => {
  try {
    const response = await customFetch(token, `ventas/generar-xml/${idpedido}/`, {
      method: 'GET',
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pedido-${idpedido}.xml`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error al generar el XML', error);
  }
};

export async function GetPedidoListApi(token:string | null) {
    try {
        const response = await customFetch(token, `ventas/pedido`, {
            
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
            return data as TPedido[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de pedido:", error);
        return [];
    }
}

export async function GetPedidoPorCotizacionDetailApi(token:string | null, idcotizacion: number){
    try {
        const response = await customFetch(token,`ventas/pedido/?cotizacion_id=${idcotizacion}` , {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data[0] as TPedido;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de pedido:", error);
        return null;
    }
}

export async function GetPedidoDetailApi(token:string | null, id: number | null ){
    try {
        const response = await customFetch(token, `ventas/pedido/${id}` , {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TPedido;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de pedido:", error);
        return null;
    }
}


export async function PostPedidoAPI(token:string | null, data: TPedido){
    try {
        const response = await customFetch(token,`ventas/pedido/`, {
            
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
        return responseData as TPedido;
        
    } catch (error) {
        console.error("Error al guardar pedido:", error);
        return null;
    }
}

export async function DeletePedidoAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `ventas/pedido/${id}/`, {
            
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
        console.error(`Error al borrar pedido ${id}: `, error);
        return false;
    }
}

export async function UpdatePedidoAPI(token:string | null, id: number, data: TPedido) {
    try {
      const response = await customFetch(token, `ventas/pedido/${id}/`, {
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
      return responseData as TPedido;
  
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      return null;
    }
  }

export const descargarPedidosAPI = async (token: string | null,fechaInicio: string, fechaFin: string, tipoFecha:string) => {
    try {
      const response = await customFetch(token,'ventas/descargar-pedidos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          tipo_fecha: tipoFecha
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
      link.setAttribute('download', 'pedidos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al intentar descargar el archivo.');
      console.error(error);
    }
};