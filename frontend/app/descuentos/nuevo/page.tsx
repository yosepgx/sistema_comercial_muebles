"use client"

import FormRegla from "@/components/descuentos/formRegla"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { usePermiso } from "@/hooks/usePermiso"

export default function DescuentoNuevoPage(){
    const puedeCrearDescuentos = usePermiso(PERMISSION_KEYS.REGLA_DESCUENTO_CREAR)
    return (
        <ProtectedRoute>
            <MainWrap>
                {puedeCrearDescuentos && <FormRegla tipo="nuevo"></FormRegla>}
            </MainWrap>
        </ProtectedRoute>
    )
}