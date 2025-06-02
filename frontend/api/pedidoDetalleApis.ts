import { customFetch } from "@/components/customFetch";
import { TPedidoDetalle } from "@/components/types/pedido";

export async function GetPedidoLineaListApi(token:string | null, idpedido: number) {
    try {
        const response = await customFetch(token, `ventas/pedido-detalle/?pedido=${idpedido}`, {
            
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
            return data as TPedidoDetalle[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de pedido-detalle:", error);
        return [];
    }
}

export async function GetPedidoLineaDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`ventas/pedido-detalle/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TPedidoDetalle;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de pedido-detalle:", error);
        return null;
    }
}
export async function PostPedidoLineaAPI(token:string | null, data: TPedidoDetalle){
    try {
        const response = await customFetch(token,`ventas/pedido-detalle/`, {
            
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
        return responseData as TPedidoDetalle;
        
    } catch (error) {
        console.error("Error al guardar pedido-detalle:", error);
        return null;
    }
}

export async function DeletePedidoLineaAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `ventas/pedido-detalle/${id}/`, {
            
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
        console.error(`Error al borrar pedido-detalle ${id}: `, error);
        return false;
    }
}

export async function UpdatePedidoLineaAPI(token:string | null, id: number, data: TPedidoDetalle) {
    try {
      const response = await customFetch(token, `ventas/pedido-detalle/${id}/`, {
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
      return responseData as TPedidoDetalle;
  
    } catch (error) {
      console.error("Error al actualizar pedido-detalle:", error);
      return null;
    }
  }