"use client"

import { ProtectedRoute } from '@/components/protectedRoute';
import MainWrap from '@/components/mainwrap';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HistorialPrecio from './HistorialPrecio';
import FormularioProducto from '../FormularioProducto';
import { useProductoContext } from '../productoContext';

export default function ProductoDetailPage() {
  const {crrProduct} = useProductoContext()
  return (
    <ProtectedRoute>
      <MainWrap>
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
      
    </MainWrap>
  </ProtectedRoute>
  );
}

