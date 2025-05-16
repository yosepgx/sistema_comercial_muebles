"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"



export default function CategoriasPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                categorias
            </MainWrap>
        </ProtectedRoute>
    )
}