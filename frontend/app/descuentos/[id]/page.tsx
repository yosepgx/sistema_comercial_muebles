"use client"

import FormRegla from "@/components/descuentos/formRegla"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { usePermiso } from "@/hooks/usePermiso"

export default function DescuentoEdicionPage(){
    const puedeGestionarDescuentos = usePermiso(PERMISSION_KEYS.REGLA_DESCUENTO_ACTUALIZAR)
    return (
        <ProtectedRoute>
            <MainWrap>
                {puedeGestionarDescuentos && <FormRegla tipo="edicion"></FormRegla>}
            </MainWrap>
        </ProtectedRoute>
    )
}