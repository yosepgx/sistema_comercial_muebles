'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import Loading from './loading';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuth } = useAuth();
  const router = useRouter();

  //talvez el refresh deberia de estar aqui porque el layout parece solo hacerse al momento de crearse la app
  //luego si ocurre un error entonces ya no se vuelve a refrescar y se pierde el user y el token en ct 
  useEffect(() => {
    //const token = localStorage.getItem('access-token')
    if(!isLoading && !isAuth){
      router.push('/login')
    }
  }, [isLoading, isAuth, router]);

  if (isLoading) {
    return <Loading/>;
  }

  return isAuth ? <>{children}</> : null;
};
