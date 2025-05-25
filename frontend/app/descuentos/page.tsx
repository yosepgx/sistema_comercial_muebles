"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function DescuentosPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                descuentos
            </MainWrap>
        </ProtectedRoute>
    )
}