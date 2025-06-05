"use client"

import MainWrap from "@/components/mainwrap"
import FormPedidoStandAlone from "@/components/pedidos/formPedidoStandAlone"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function PedidosEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormPedidoStandAlone tipo="edicion"/>
            </MainWrap>
        </ProtectedRoute>
    )
}