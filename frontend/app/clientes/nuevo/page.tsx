"use client"

import FormClienteStandAlone from "@/components/clientes/formClienteStandAlone"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function ClienteNuevoPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormClienteStandAlone tipo='nuevo'/>
            </MainWrap>
        </ProtectedRoute>
    )
}