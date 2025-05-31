'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormOportunidad from "@/components/formOportunidad"
import FormCliente from "@/components/formCliente"
import FormCotizaciones from "@/components/formCotizaciones"
import FormPedido from "@/components/formPedido"
import { useOportunidadContext } from "@/context/oportunidadContext"
import { useEffect } from "react"
import { GetOportunidadDetailApi } from "@/api/oportunidadApis"

export default function InnerPageOportunidad() {
  const {crrTab, setCrrTab, setTipoEdicion, tipoEdicion, setCrrOportunidad, crrOportunidad} = useOportunidadContext()
  
  useEffect(()=>{
    if(tipoEdicion === 'nuevo'){
      const id= localStorage.getItem('nueva-oportunidad')
      if(id){
        GetOportunidadDetailApi('token', parseInt(id,10))
        .then(data => setCrrOportunidad(data))
      }
    }
    //se quita  nueva-cotizacion  del storage al salir de la vista de oportunidad nueva o al terminar la creacion
  },[])

  return (
    <div className="p-6">
      {/* Navegación de pasos */}
      <Tabs value={crrTab} onValueChange={setCrrTab}className="mb-6">
        <TabsList>
          <TabsTrigger value="oportunidad">Oportunidad</TabsTrigger>
          <TabsTrigger value="cotizaciones">Cotizaciones</TabsTrigger>
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="pedido">Pedido</TabsTrigger>
          <TabsTrigger value="despacho">Despacho</TabsTrigger>
        </TabsList>

        <TabsContent value="oportunidad">
          <h2 className="text-xl font-bold">Oportunidad</h2>
          <FormOportunidad key={crrOportunidad?.id || 'nuevo'} />
        </TabsContent>

        <TabsContent value="cotizaciones">
          <h2 className="text-xl font-bold">Cotizaciones</h2>
          <FormCotizaciones key={`cotizaciones-${crrOportunidad?.id || 'nuevo'}`} />
        </TabsContent>

        <TabsContent value="cliente">
          <h2 className="text-xl font-bold">Cliente</h2>
          {/* Usar key para forzar re-renderizado cuando cambia la oportunidad o el cliente */}
          <FormCliente key={`cliente-${crrOportunidad?.id || 'nuevo'}-${crrOportunidad?.cliente || 'sin-cliente'}`} />
        </TabsContent>

        <TabsContent value="pedido">
          <h2 className="text-xl font-bold">Pedido</h2>
          <FormPedido key={`pedido-${crrOportunidad?.id || 'nuevo'}`} />
        </TabsContent>

        <TabsContent value="despacho">
          <h2 className="text-xl font-bold">Despacho</h2>
          <FormPedido key={`despacho-${crrOportunidad?.id || 'nuevo'}`} />
        </TabsContent>

      </Tabs>
      
    </div>
  )
}