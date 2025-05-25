import { customFetch } from "@/components/customFetch";
import { TOportunidad } from "@/components/types/oportunidad"; 

export async function GetOportunidadListApi(token:string | null) {
    try {
        const response = await customFetch(token, `oportunidades/oportunidad`, {
            
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
            return data as TOportunidad[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos de oportunidad:", error);
        return [];
    }
}

export async function GetOportunidadDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`oportunidades/oportunidad/${id}`, {
            
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as TOportunidad;
        
    } catch (error) {
        console.error("Error al obtener datos de detalle de oportunidad:", error);
        return null;
    }
}
export async function PostOportunidadAPI(token:string | null, data: TOportunidad){
    try {
        const response = await customFetch(token,`oportunidades/oportunidad/`, {
            
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
        return responseData as TOportunidad;
        
    } catch (error) {
        console.error("Error al guardar oportunidad:", error);
        return null;
    }
}

export async function DeleteOportunidadAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `oportunidades/oportunidad/${id}/`, {
            
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
        console.error(`Error al borrar oportunidad ${id}: `, error);
        return false;
    }
}

export async function UpdateOportunidadAPI(token:string | null, id: number, data: TOportunidad) {
    try {
      const response = await customFetch(token, `oportunidades/oportunidad/${id}/`, {
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
      return responseData as TOportunidad;
  
    } catch (error) {
      console.error("Error al actualizar oportunidad:", error);
      return null;
    }
  }