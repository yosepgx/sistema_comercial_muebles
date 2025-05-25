"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function GeneralEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                general edit
            </MainWrap>
        </ProtectedRoute>
    )
}