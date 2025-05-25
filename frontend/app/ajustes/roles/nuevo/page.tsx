"use client"
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function NuevoRolPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                rol nuevo
            </MainWrap>
        </ProtectedRoute>
    )
}