"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function CotizacionEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                cotizacion Edit
            </MainWrap>
        </ProtectedRoute>
    )
}