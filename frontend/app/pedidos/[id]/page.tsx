"use client"

import MainWrap from "@/components/mainwrap"
import FormPedidoStandAlone from "@/components/pedidos/formPedidoStandAlone"
import { ProtectedRoute } from "@/components/protectedRoute"
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { usePermiso } from "@/hooks/usePermiso"

export default function PedidosEditPage(){
    const puedeverPedidos = usePermiso(PERMISSION_KEYS.PEDIDO_LEER_TODOS)
    return (
        <ProtectedRoute>
            <MainWrap>
                {puedeverPedidos && <FormPedidoStandAlone tipo="edicion"/>}
            </MainWrap>
        </ProtectedRoute>
    )
}