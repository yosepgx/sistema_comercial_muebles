"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function CotizacionesPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                cptizaciones
            </MainWrap>
        </ProtectedRoute>
    )
}