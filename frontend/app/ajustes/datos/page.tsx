"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function DatosPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                datos
            </MainWrap>
        </ProtectedRoute>
    )
}