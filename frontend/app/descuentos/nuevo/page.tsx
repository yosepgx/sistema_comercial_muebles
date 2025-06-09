"use client"

import FormRegla from "@/components/descuentos/formRegla"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function DescuentoNuevoPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormRegla tipo="nuevo"></FormRegla>
            </MainWrap>
        </ProtectedRoute>
    )
}