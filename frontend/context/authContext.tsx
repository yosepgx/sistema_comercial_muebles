"use client"
import { usePathname } from "next/navigation";
import {createContext, useContext, useState, ReactNode, useEffect, SetStateAction, Dispatch} from "react"
interface UserLogin{
    username: string;
    password: string;
}
interface UserRecover{
    token: string;
    username: string;
    password: string;
    perfil: {
        dni: string;
        telefono: string;
    }
}

interface AuthContextType{
    user: UserRecover | null;
    ct: string | null;
    fetchLogin: (userData: UserLogin) => void; //guardar estados
    fetchLogout: () => void; //quitar estados
    fetchRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType| undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<UserRecover | null> (null);
    const [ct, setCt] = useState<string | null>(null)
    const currentPath = usePathname()
    const ApiURL = process.env.NEXT_PUBLIC_BACKEND_URL

    const fetchRefresh = async() => {
        try {
            const token = localStorage.getItem('access-token');
            
            if (!token) {
                console.error("No hay token disponible");
                return;
            }
            setCt(token)
            const response = await fetch(`${ApiURL}usuarios/test_token`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
            });
            
            if (!response.ok) {
                console.error("El token no es válido o hubo un problema con la API");
                return;
            }
            
            const data = await response.json();
            
            if (!data.is_valid) {
                console.error("El usuario no está identificado");
                return;
            }
            
            setUser(data.user);
            
        } catch (error) {
            console.error(`Error, fetchRefresh: No se pudo comprobar el token ${error}`);
        }
    };

    useEffect(()=>{
        if(currentPath !== '/login'){
            fetchRefresh();
        }
    },[])

    const fetchLogin = async (loginData: UserLogin) =>{
        try{
            const response  = await fetch(`${ApiURL}usuarios/login`,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
              })
              if( !response.ok){
                console.error("Error con el login de la aplicacion")
                return
              }
              const data: UserRecover = await response.json();
              
              setUser(data);
              localStorage.setItem('access-token',data.token)
              return

        }
        catch(e){
            console.error(`Fallo en el login ${e}`)
        } 
    }

    const fetchLogout = async () => {
        try {
            const token = localStorage.getItem('access-token');
            localStorage.removeItem('access-token');
            setUser (null);
            const response = await fetch(`${ApiURL}usuarios/logout`,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
              })
            if (!response.ok){
                console.error('Error de servidor logout')
                return
            }
            
        } catch (error) {
            console.error(`Fallo en el logout ${error}`)
        }
    }

    return(
        <AuthContext.Provider value = {{user, fetchLogin, fetchLogout, fetchRefresh, ct}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
  };