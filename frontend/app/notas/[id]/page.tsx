"use client"

import MainWrap from "@/components/mainwrap"
import FormNotaCreditoDebito from "@/components/notas/formNota"
import { ProtectedRoute } from "@/components/protectedRoute"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function  NotaEditPage(){
    const {id} = useParams()


    if(!id)return (<div>Cargando...</div>)
    
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormNotaCreditoDebito edicion='edicion' pedido={null} notaid={parseInt(id as string, 10)} detalles={[]}/>
            </MainWrap>
        </ProtectedRoute>
    )
}