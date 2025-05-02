"use client"
import { useRouter } from 'next/navigation';
import { useProductoContext } from '../productoContext';
import { useAuth } from '@/context/authContext';

//interface Params {
//  params: { id: string };
//}

export default function ProductoDetailPage() {
  //const { id } = params;  
  // aquí podrías fetch(`/api/productos/${id}`) o similar
  const {crrProduct} = useProductoContext()
  const {user, ct} = useAuth()

  return (
    <div>
      <h1>Detalle del Producto {crrProduct?.id}</h1>
      <h2>nombre del Producto {crrProduct?.nombre}</h2>
      <h2>mi usuarios es : {user?.username}</h2>
    </div>
  );
}