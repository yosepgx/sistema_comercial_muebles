import { customFetch } from "@/components/customFetch";
import { TSede } from "@/components/types/sede";
import { z } from "zod";


export async function GetSedeListApi(token:string | null) {
    try {
        const response = await customFetch(token, `ajustes/sede`, {
            
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
            return data as TSede[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de sedes:", error);
        return [];
    }
}

export async function GetSedeDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`ajustes/sede/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TSede;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de sede:", error);
        return null;
    }
}
export async function PostSedeAPI(token:string | null, data: TSede){
    try {
        const response = await customFetch(token,`ajustes/sede/`, {
            
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
        return responseData as TSede;
        
    } catch (error) {
        console.error("Error al guardar detalle de sede:", error);
        return null;
    }
}

export async function DeleteSedeAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `ajustes/sede/${id}/`, {
            
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
        console.error(`Error al borrar sede ${id}: `, error);
        return false;
    }
}

export async function UpdateSedeAPI(token:string | null, id: number, data: TSede) {
    try {
      const response = await customFetch(token, `ajustes/sede/${id}/`, {
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
      return responseData as TSede;
  
    } catch (error) {
      console.error("Error al actualizar sede:", error);
      return null;
    }
  }