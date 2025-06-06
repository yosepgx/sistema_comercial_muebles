"use client"

import { ProtectedRoute } from '@/components/protectedRoute';
import MainWrap from '@/components/mainwrap';

import FormularioProducto from '@/components/producto/FormularioProducto';

export default function NuevoProductoPage(){
    return (
    <>
        <ProtectedRoute>
          <MainWrap>
            <h2 className="text-xl font-bold">Nuevo producto</h2>
            <FormularioProducto crrProduct = {null}  editing = {false}/>
          
        </MainWrap>
      </ProtectedRoute>
    </>
    );
}