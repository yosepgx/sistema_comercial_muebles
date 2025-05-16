"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function CategoriaNuevaPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                categoria Nueva
            </MainWrap>
        </ProtectedRoute>
    )
}