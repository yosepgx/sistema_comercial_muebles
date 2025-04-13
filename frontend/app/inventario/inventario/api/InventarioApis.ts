export interface Inventario {
    id: number
    cantidad_disponible: string
    cantidad_comprometida: string
    producto: number
    almacen: string
  }

export async function GetInventarioListApi() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}inventario/inventario/`, {
            credentials: 'include',
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        
        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }
        const data = await response.json();
        if (data) {
            return data as Inventario[];
        }
        return [];
        
    } catch (error) {
        console.error("Error al obtener datos del inventario:", error);
        return [];
    }
}

export async function GetInventarioDetailApi(id: number){
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}inventario/inventario/${id}/`, {
            credentials: 'include',
            method: "get",
            headers:{
                'Content-Type':'application/json' ,
            }
        });

        if(!response.ok){
            throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`)

        }

        const data = await response.json();
        return data as Inventario;
        
    } catch (error) {
        console.error("Error al obtener datos de registro de inventario:", error);
        return null;
    }
}
export async function PostInventarioAPI(data: Inventario){
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}inventario/inventario/`, {
            credentials: 'include',
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
        return responseData as Inventario;
        
    } catch (error) {
        console.error("Error al guardar registro de inventario:", error);
        return null;
    }
}

export async function DeleteInventarioAPI(id: number){
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}inventario/inventario/${id}/`, {
            credentials: 'include',
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
        console.error("Error al borrar registro de inventario:", error);
        return false;
    }
}

export async function UpdateInventarioAPI(id: number, data: Inventario) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}inventario/inventario/${id}/`, {
        credentials: 'include',
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
      return responseData as Inventario;
  
    } catch (error) {
      console.error("Error al actualizar registro de inventario:", error);
      return null;
    }
  }