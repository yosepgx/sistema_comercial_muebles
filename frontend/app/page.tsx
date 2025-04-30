import Navbar from "@/components/navbar";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function HomePage() {
  return (
    <>
      <ProtectedRoute>
      <Navbar/>
      <div >
        Hola Main
      </div>
      </ProtectedRoute>
    </>
  );
}
