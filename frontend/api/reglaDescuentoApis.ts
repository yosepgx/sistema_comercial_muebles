import { customFetch } from "@/components/customFetch";
import {TRegla} from '@/components/types/reglaDescuento';

export async function GetReglaListApi(token:string | null) {
    try {
        const response = await customFetch(token, `descuentos/regla-descuento`, {
            
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
            return data as TRegla[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener reglas de descuento:", error);
        return [];
    }
}

export async function GetReglaDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`descuentos/regla-descuento/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TRegla;
        
    } catch (error) {
        console.error("Error al obtener registro de reglas de descuento:", error);
        return null;
    }
}
export async function PostReglaAPI(token:string | null, data: TRegla){
    try {
        const response = await customFetch(token,`descuentos/regla-descuento/`, {
            
            method: "POST",
            headers:{
                'Content-Type':'application/json' ,
            },
            body: JSON.stringify(data),
        });

        let responseData: any = null;

        try {
            responseData = await response.json();
            console.log('data obtenida', responseData)
        } catch {
            responseData = null;
        }

        if(!response.ok){
            
            if(responseData?.code?.includes('DESCUENTO_ERR')){
                alert(responseData?.message)
            }
            else{
                alert('Error inesperado del servidor');
            }
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }


        return responseData?.data as TRegla;
        
    } catch (error) {
        console.error("Error al guardar reglas de descuento:", error);
        return null;
    }
}

export async function DeleteReglaAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `descuentos/regla-descuento/${id}/`, {
            
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
        console.error(`Error al borrar reglas de descuento ${id}: `, error);
        return false;
    }
}

export async function UpdateReglaAPI(token:string | null, id: number, data: TRegla) {
    try {
      const response = await customFetch(token, `descuentos/regla-descuento/${id}/`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

        let responseData: any = null;

        try {
            responseData = await response.json();
        } catch {
            responseData = null;
        }

        if(!response.ok){
            
            if(responseData?.code?.include('DESCUENTO_ERR')){
                alert(responseData?.message)
            }
            else{
                alert('Error inesperado del servidor');
            }
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }
  
      return responseData?.data as TRegla;
  
    } catch (error) {
      console.error("Error al actualizar reglas de descuento:", error);
      return null;
    }
  }