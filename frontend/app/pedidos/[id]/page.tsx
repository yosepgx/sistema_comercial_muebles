"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function PedidosEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                pedidos edit
            </MainWrap>
        </ProtectedRoute>
    )
}