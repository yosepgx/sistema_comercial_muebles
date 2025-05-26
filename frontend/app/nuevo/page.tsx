'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormOportunidad from "@/components/formOportunidad"
import FormCliente from "@/components/formCliente"
import FormCotizaciones from "@/components/formCotizaciones"
import FormPedido from "@/components/formPedido"

export default function NuevaOportunidadPage() {
  return (
    <div className="p-6">
      {/* Navegación de pasos */}
      <Tabs defaultValue="oportunidad" className="mb-6">
        <TabsList>
          <TabsTrigger value="oportunidad">Oportunidad</TabsTrigger>
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="cotizaciones">Cotizaciones</TabsTrigger>
          <TabsTrigger value="pedido">Pedido</TabsTrigger>
          <TabsTrigger value="despacho">Despacho</TabsTrigger>
        </TabsList>

        <TabsContent value = "oportunidad">
          <h2 className="text-xl font-bold">oportunidad</h2>
          <FormOportunidad/>
        </TabsContent>

        <TabsContent value = "cliente">
          <h2 className="text-xl font-bold">Cliente</h2>
          <FormCliente/>
        </TabsContent>

        <TabsContent value = "cotizaciones">
          <h2 className="text-xl font-bold">Cotizaciones</h2>
          <FormCotizaciones/>
        </TabsContent>

        <TabsContent value = "pedido">
          <h2 className="text-xl font-bold">Pedido</h2>
          <FormPedido/>
        </TabsContent>

      </Tabs>
      
    </div>
  )
}