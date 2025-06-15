'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormOportunidad from "@/components/formOportunidad"
import FormCliente from "@/components/formCliente"
import FormCotizaciones from "@/components/formCotizaciones"
import FormPedido from "@/components/formPedido"
import { ProtectedRoute } from "@/components/protectedRoute"
import MainWrap from "@/components/mainwrap"
import { OportunidadProvider, useOportunidadContext } from "@/context/oportunidadContext"
import InnerPageOportunidad from "@/components/innerPageOportunidad"
import { usePermiso } from "@/hooks/usePermiso"
import { PERMISSION_KEYS } from "@/constants/constantRoles"

export default function NuevaOportunidadPage() {
  const puedeCrearOportunidades = usePermiso(PERMISSION_KEYS.OPORTUNIDAD_CREAR)
  return (
  <ProtectedRoute>
    <MainWrap>
      {puedeCrearOportunidades && <OportunidadProvider>
      <InnerPageOportunidad tipo="nuevo"/>
      </OportunidadProvider>}
    </MainWrap>
  </ProtectedRoute>
  )
}