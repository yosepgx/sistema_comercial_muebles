import { customFetch } from "@/components/customFetch";
import { Tusuario } from "../types/ajusteTypes";


export async function GetRolListApi(token:string | null) {
    try {
        const response = await customFetch(token, `usuarios/roles`, {
            
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
            return data as Tusuario[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de roles:", error);
        return [];
    }
}

export async function GetRolDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`usuarios/roles/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as Tusuario;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de rol:", error);
        return null;
    }
}
export async function PostRolAPI(token:string | null, data: Tusuario){
    try {
        const response = await customFetch(token,`usuarios/roles/`, {
            
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
        return responseData as Tusuario;
        
    } catch (error) {
        console.error("Error al guardar detalle de rol:", error);
        return null;
    }
}

export async function DeleteRolAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `usuarios/roles/${id}/`, {
            
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
        console.error(`Error al borrar registro de rol ${id}: `, error);
        return false;
    }
}

export async function UpdateRolAPI(token:string | null, id: number, data: Tusuario) {
    try {
      const response = await customFetch(token, `usuarios/roles/${id}/`, {
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
      return responseData as Tusuario;
  
    } catch (error) {
      console.error("Error al actualizar registro de roles:", error);
      return null;
    }
  }