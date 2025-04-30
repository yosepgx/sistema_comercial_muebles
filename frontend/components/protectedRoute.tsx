'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false)

  //talvez el refresh deberia de estar aqui porque el layout parece solo hacerse al momento de crearse la app
  //luego si ocurre un error entonces ya no se vuelve a refrescar y se pierde el user y el token en ct 
  useEffect(() => {
    const token = localStorage.getItem('access-token')
    if (!token) {
      router.push('/login');
      setIsAuth(false)
      return
    }
    else{
      setIsAuth(true)
    }
  }, []);

  if (!isAuth) {
    return <div>No autenticado...</div>; 
  }

  return <>{children}</>;
};
