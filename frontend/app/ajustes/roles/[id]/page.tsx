"use client"
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function RolEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                rol id
            </MainWrap>
        </ProtectedRoute>
    )
}