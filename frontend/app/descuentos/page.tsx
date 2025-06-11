"use client"

import DescuentosTabs from "@/components/descuentos/descuentosTabs"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { usePermiso } from "@/hooks/usePermiso"

export default function DescuentosPage(){
    const puedeGestionarDescuentos = usePermiso(PERMISSION_KEYS.REGLA_DESCUENTO_LEER)
    return (
        <ProtectedRoute>
            <MainWrap>
                {puedeGestionarDescuentos && <DescuentosTabs></DescuentosTabs>}
            </MainWrap>
        </ProtectedRoute>
    )
}