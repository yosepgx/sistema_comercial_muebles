"use client"

import DescuentosTabs from "@/components/descuentos/descuentosTabs"
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"

export default function DescuentosPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <DescuentosTabs></DescuentosTabs>
            </MainWrap>
        </ProtectedRoute>
    )
}