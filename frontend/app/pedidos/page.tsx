"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function PedidosPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                pedidos
            </MainWrap>
        </ProtectedRoute>
    )
}