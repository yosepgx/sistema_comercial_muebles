"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function sedeEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                sede edit
            </MainWrap>
        </ProtectedRoute>
    )
}