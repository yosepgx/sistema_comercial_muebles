"use client"

import FormularioGeneral from "@/components/general/formularioGeneral"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function GeneralEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormularioGeneral tipo ="edicion"/>
            </MainWrap>
        </ProtectedRoute>
    )
}