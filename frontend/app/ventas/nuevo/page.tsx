"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function VentaNuevaPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                venta nueva
            </MainWrap>
        </ProtectedRoute>
    )
}