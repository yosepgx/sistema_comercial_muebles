import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function UsuarioEditPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                usuario id

            </MainWrap>
        </ProtectedRoute>
    )
}