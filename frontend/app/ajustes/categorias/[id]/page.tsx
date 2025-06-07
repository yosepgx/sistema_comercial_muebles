"use client"

import FormularioCategorias from "@/components/categorias/formularioCategorias"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function CategoriaEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormularioCategorias tipo = 'edicion'/>
            </MainWrap>
        </ProtectedRoute>
    )
}