"use client"

import FormCotizacionStandAlone from "@/components/cotizaciones/formCotizacionStandAlone"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function CotizacionEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormCotizacionStandAlone edicionCotizacion='edicion'/>
            </MainWrap>
        </ProtectedRoute>
    )
}