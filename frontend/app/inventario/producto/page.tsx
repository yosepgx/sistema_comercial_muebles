import Navbar from "@/components/navbar";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function productoPage(){
    return(
        <>
            <ProtectedRoute>
                <Navbar/>
                <div>Hola producto</div>
            </ProtectedRoute>
        </>
    )
}