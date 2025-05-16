"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function ClienteEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                cliente edit
            </MainWrap>
        </ProtectedRoute>
    )
}