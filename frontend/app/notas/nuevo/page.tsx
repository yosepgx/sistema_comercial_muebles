"use client"

import MainWrap from "@/components/mainwrap"
import NotaCreditoDebitoLoader from "@/components/notas/notaLoader"
import { ProtectedRoute } from "@/components/protectedRoute"
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { usePermiso } from "@/hooks/usePermiso"
import { Suspense } from "react"

export default function  NotaNuevoPage(){
    const puedeCrearNotas = usePermiso(PERMISSION_KEYS.NOTAS_CREAR)
    return (
        <ProtectedRoute>
            <MainWrap>
                <Suspense fallback={<p>Cargando datos del pedido...</p>}>
                {puedeCrearNotas && <NotaCreditoDebitoLoader />}
              </Suspense>
            </MainWrap>
        </ProtectedRoute>
    )
}