"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function VentasPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                ventas
            </MainWrap>
        </ProtectedRoute>
    )
}