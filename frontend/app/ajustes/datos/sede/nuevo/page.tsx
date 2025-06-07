"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import FormularioSede from "@/components/sedes/formSedes"

export default function sedeNuevaPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormularioSede tipo = "nuevo"/>
            </MainWrap>
        </ProtectedRoute>
    )
}