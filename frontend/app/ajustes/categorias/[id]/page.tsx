"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function CategoriaEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                categoria Edit
            </MainWrap>
        </ProtectedRoute>
    )
}