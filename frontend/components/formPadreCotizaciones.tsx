"use client"

import { useOportunidadContext } from "@/context/oportunidadContext"
import FormCotizaciones from "./formCotizaciones"
import FormCotizacionDetalle from "./formCotizacion"

export default function FormPadreCotizaciones() {
    const {modoCotizacion}= useOportunidadContext()
    return (
        <>
        {modoCotizacion === 'muchas' && (
        <>
            <h2 className="text-xl font-bold">Cotizaciones</h2>
            <FormCotizaciones></FormCotizaciones>
        </>
        )}
        {modoCotizacion === 'una' &&(
            <FormCotizacionDetalle></FormCotizacionDetalle>
        )}
        </>
    )
}