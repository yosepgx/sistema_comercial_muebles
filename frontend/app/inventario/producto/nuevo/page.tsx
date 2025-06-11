"use client"

import { ProtectedRoute } from '@/components/protectedRoute';
import MainWrap from '@/components/mainwrap';

import FormularioProducto from '@/components/producto/FormularioProducto';
import { usePermiso } from '@/hooks/usePermiso';
import { PERMISSION_KEYS } from '@/constants/constantRoles';

export default function NuevoProductoPage(){
    const puedeGestionarProducto = usePermiso(PERMISSION_KEYS.PRODUCTO_ACTUALIZAR)
    return (
    <>
        <ProtectedRoute>
          <MainWrap>
          {puedeGestionarProducto && <>
            
            <h2 className="text-xl font-bold">Nuevo producto</h2>
            <FormularioProducto crrProduct = {null}  editing = {false}/>
          </>}
        </MainWrap>
      </ProtectedRoute>
    </>
    );
}