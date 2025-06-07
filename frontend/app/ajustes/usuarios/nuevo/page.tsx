import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import FormularioUsuario from "@/components/usuarios/formularioUsuario";

export default function UsuarioNuevoPage(){
    return (
        <ProtectedRoute>
            <MainWrap>
                <FormularioUsuario tipo='nuevo'/>
            </MainWrap>
        </ProtectedRoute>
    )
}