import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function UsuarioNuevoPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                usuario nuevo

            </MainWrap>
        </ProtectedRoute>
    )
}