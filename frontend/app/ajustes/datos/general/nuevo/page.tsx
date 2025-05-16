"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function GeneralNuevoPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                nuevo general
            </MainWrap>
        </ProtectedRoute>
    )
}