"use client"
import MainWrap from "@/components/mainwrap";
import Navbar from "@/components/navbar";
import { ProtectedRoute } from "@/components/protectedRoute";

export default function HomePage() {
  return (
    <>
      <ProtectedRoute>
        <MainWrap>
          <div >
            Hola Main
          </div>
        </MainWrap>
      </ProtectedRoute>
    </>
  );
}
