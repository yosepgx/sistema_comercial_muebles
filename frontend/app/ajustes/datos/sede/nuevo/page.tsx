"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function sedeNuevaPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                sede nueva
            </MainWrap>
        </ProtectedRoute>
    )
}