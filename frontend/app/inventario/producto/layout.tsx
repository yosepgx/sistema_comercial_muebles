"use client"

import { ProductoProvider } from "@/context/productoContext"

export default function ProductoLayout({
    children,
  }: Readonly<{children: React.ReactNode}>) {
    return (
        <>
            <ProductoProvider>
                {children}
            </ProductoProvider>
        </>
    )
  }