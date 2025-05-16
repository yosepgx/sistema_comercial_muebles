"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function ClienteNuevoPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                cliente nuevo
            </MainWrap>
        </ProtectedRoute>
    )
}