"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function VentasEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                venta edit
            </MainWrap>
        </ProtectedRoute>
    )
}