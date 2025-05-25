import { customFetch } from "@/components/customFetch";
import { TDGeneral } from "@/components/types/dgeneralType";
import { z } from "zod";


export async function GetDatoGeneralListApi(token:string | null) {
    try {
        const response = await customFetch(token, `ajustes/datogeneral`, {
            
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
            return data as TDGeneral[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos generales:", error);
        return [];
    }
}

export async function GetDatoGeneralDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`ajustes/datogeneral/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TDGeneral;
        
    } catch (error) {
        console.error("Error al obtener registro de dato general:", error);
        return null;
    }
}
export async function PostDatoGeneralAPI(token:string | null, data: TDGeneral){
    try {
        const response = await customFetch(token,`ajustes/datogeneral/`, {
            
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
        return responseData as TDGeneral;
        
    } catch (error) {
        console.error("Error al guardar dato general:", error);
        return null;
    }
}

export async function DeleteDatoGeneralAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `ajustes/datogeneral/${id}/`, {
            
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
        console.error(`Error al borrar datogeneral ${id}: `, error);
        return false;
    }
}

export async function UpdateDatoGeneralAPI(token:string | null, id: number, data: TDGeneral) {
    try {
      const response = await customFetch(token, `ajustes/datogeneral/${id}/`, {
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
      return responseData as TDGeneral;
  
    } catch (error) {
      console.error("Error al actualizar dato general:", error);
      return null;
    }
  }