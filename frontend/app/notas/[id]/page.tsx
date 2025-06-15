"use client"

import MainWrap from "@/components/mainwrap"
import FormNotaCreditoDebito from "@/components/notas/formNota"
import { ProtectedRoute } from "@/components/protectedRoute"
import { PERMISSION_KEYS } from "@/constants/constantRoles"
import { usePermiso } from "@/hooks/usePermiso"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function  NotaEditPage(){
    const {id} = useParams()
    const puedeVerNotas = usePermiso(PERMISSION_KEYS.PEDIDO_LEER_TODOS)

    if(!id)return (<div>Cargando...</div>)
    
    return (
        <ProtectedRoute>
            <MainWrap>
                {puedeVerNotas && <FormNotaCreditoDebito edicion='edicion' pedido={null} notaid={parseInt(id as string, 10)} detalles={[]}/>}
            </MainWrap>
        </ProtectedRoute>
    )
}