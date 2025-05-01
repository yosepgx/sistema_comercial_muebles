import MainWrap from "@/components/mainwrap";
import Navbar from "@/components/navbar";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function productoPage(){
    return(
        <>
            <ProtectedRoute>
                <MainWrap>
                    <div>Hola producto</div>
                </MainWrap>
            </ProtectedRoute>
        </>
    )
}