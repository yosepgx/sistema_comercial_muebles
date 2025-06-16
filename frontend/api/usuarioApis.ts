import { customFetch } from "@/components/customFetch";
import { FormPasswordData } from "@/components/schemas/formPasswordSchema";
import { Tusuario } from "@/components/types/usuarioType"; 


export async function GetUsuarioListApi(token:string | null) {
    try {
        const response = await customFetch(token, `usuarios/usuarios`, {
            
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
        console.error("Error al obtener datos de usuarios:", error);
        return [];
    }
}

export async function GetUsuarioDetailApi(token:string | null, id: number){
    try {
        const response = await customFetch(token,`usuarios/usuarios/${id}`, {
            
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
        console.error("Error al obtener datos de detalle de usuario:", error);
        return null;
    }
}
export async function PostUsuarioAPI(token:string | null, data: Tusuario){
    try {
        const response = await customFetch(token,`usuarios/usuarios/`, {
            
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
        console.error("Error al guardar detalle de usuario:", error);
        return null;
    }
}

export async function DeleteUsuarioAPI(token:string | null, id: number){
    try {
        const response = await customFetch(token, `usuarios/usuarios/${id}/`, {
            
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
        console.error(`Error al borrar registro de usuario ${id}: `, error);
        return false;
    }
}

export async function UpdateUsuarioAPI(token:string | null, id: number, data: Tusuario) {
    try {
      const response = await customFetch(token, `usuarios/usuarios/${id}/`, {
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
      console.error("Error al actualizar registro de usuarios:", error);
      return null;
    }
  }

export async function SingUpUsuarioAPI(token:string | null, data: Tusuario){
    //fields = ['id', 'username', 'email', 'groups', 'is_active']
    //groups = fields = ['id', 'name', 'permissions', 'permission_ids']
    //password
    try {
        const response = await customFetch(token,`usuarios/signup`, {
            
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
        console.error("Error al guardar detalle de usuario:", error);
        return null;
    }
}



export async function ChangePasswordAPI(token:string | null, data: FormPasswordData){
    // {
    //   "user_id": 5,
    //   "new_password": "nuevaClave123",
    //   "confirm_password": "nuevaClave123"
    // }

    try {
        const response = await customFetch(token,`usuarios/change-password/`, {
            
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
        console.error("Error al guardar detalle de usuario:", error);
        return null;
    }
}