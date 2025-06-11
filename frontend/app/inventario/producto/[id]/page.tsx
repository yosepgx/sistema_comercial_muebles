"use client"

import { ProtectedRoute } from '@/components/protectedRoute';
import MainWrap from '@/components/mainwrap';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HistorialPrecio from '@/components/producto/HistorialPrecio';
import FormularioProducto from '@/components/producto/FormularioProducto';
import { useProductoContext } from '@/context/productoContext';
import { usePermiso } from '@/hooks/usePermiso';
import { PERMISSION_KEYS } from '@/constants/constantRoles';

export default function ProductoDetailPage() {
  const puedeGestionarProducto = usePermiso(PERMISSION_KEYS.PRODUCTO_ACTUALIZAR)
  const {crrProduct} = useProductoContext()
  return (
    <ProtectedRoute>
      <MainWrap>
      {puedeGestionarProducto && <>
      <Tabs defaultValue="formulario">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value= "formulario">Formulario</TabsTrigger>
          <TabsTrigger value= "precios">Historial de precios</TabsTrigger>
        </TabsList>
        
        <TabsContent value = "formulario">
          <h2 className="text-xl font-bold">Detalles</h2>
            <FormularioProducto crrProduct = {crrProduct} editing = {true}/>
        </TabsContent>
        <TabsContent value = "precios"><HistorialPrecio/></TabsContent>
      </Tabs>
      </>}  
    </MainWrap>
  </ProtectedRoute>
  );
}

