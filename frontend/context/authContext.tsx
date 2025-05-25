"use client"
import { usePathname, useRouter } from "next/navigation";
import {createContext, useContext, useState, ReactNode, useEffect, SetStateAction, Dispatch} from "react"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

interface UserLogin{
    username: string;
    password: string;
}

interface User{
    username: string;
    email: string;
    groups: [number];
    perfil: {
        dni: string;
        telefono: string;
    }
}
interface UserRecover{
    token: string;
    user: User;
}

interface AuthContextType{
    user: User | null;
    ct: string | null;
    fetchLogin: (userData: UserLogin) => void; 
    fetchLogout: () => void; 
    fetchRefresh: () => Promise<void>;
    isLoading: boolean;
    isAuth: boolean;

}

const AuthContext = createContext<AuthContextType| undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null> (null);
    const [ct, setCt] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const currentPath = usePathname()
    const router = useRouter()
    const ApiURL = process.env.NEXT_PUBLIC_BACKEND_URL
 
    const fetchRefresh = async() => {
        try {
            const token = localStorage.getItem('access-token');
            
            if (!token) {
                setIsLoading(false)
                setIsAuth(false)
                console.log("No hay token disponible");
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
                //si el back no responde ya no tiene acceso
                localStorage.removeItem('access-token');
                //localStorage.removeItem('user-data');
                setUser(null);
                setIsAuth(false);
                setIsLoading(false);
                console.error("El token no es válido o hubo un problema con la API");
                return;
            }
            
            const data = await response.json();
            
            if (!data.is_valid) {
                localStorage.removeItem('access-token');
                //localStorage.removeItem('user-data');
                setUser(null);
                setIsAuth(false);
                console.error("El usuario no está identificado");
                return;
            }
            
            setUser(data.user);
            setIsAuth(true);
            //localStorage.setItem('user-data', JSON.stringify(data.user));
            
        } catch (error) {
            console.error(`Error, fetchRefresh: No se pudo comprobar el token ${error}`);
            setIsAuth(false);
            localStorage.removeItem('access-token'); //si pierde la conexion tendria que volver a logearse
        } finally {
            setIsLoading(false);
          }
    };

    useEffect(()=>{
        if(currentPath !== '/login'){
            fetchRefresh();
        }
        else{
            setIsLoading(false);
        }
    },[currentPath])

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
              
              setUser(data.user);
              setIsAuth(true);
              localStorage.setItem('access-token',data.token)
              router.push('/')
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
            router.push('/login')
            
        } catch (error) {
            console.error(`Fallo en el logout ${error}`)
        }
    }

    return(
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <AuthContext.Provider value = {{user, fetchLogin, fetchLogout, fetchRefresh, ct, isAuth, isLoading}}>
                {children}
            </AuthContext.Provider>
        </LocalizationProvider>

    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
  };