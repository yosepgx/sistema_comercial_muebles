"use client"

import FormRegla from "@/components/descuentos/formRegla"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function DescuentoEdicionPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormRegla tipo="edicion"></FormRegla>
            </MainWrap>
        </ProtectedRoute>
    )
}