"use client"

import MainWrap from "@/components/mainwrap"
import NotaCreditoDebitoLoader from "@/components/notas/notaLoader"
import { ProtectedRoute } from "@/components/protectedRoute"
import { Suspense } from "react"

export default function  NotaNuevoPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <Suspense fallback={<p>Cargando datos del pedido...</p>}>
                <NotaCreditoDebitoLoader />
              </Suspense>
            </MainWrap>
        </ProtectedRoute>
    )
}