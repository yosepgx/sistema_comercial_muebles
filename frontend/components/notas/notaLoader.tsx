// components/notas/notaCreditoDebitoLoader.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { GetPedidoDetailApi } from "@/api/pedidoApis"
import { TPedido, TPedidoDetalle } from "@/components/types/pedido"
import FormNotaCreditoDebito from "./formNota"
import { GetPedidoLineaListApi } from "@/api/pedidoDetalleApis"

export default function NotaCreditoDebitoLoader() {
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get('pedidoId')
  const [pedido, setPedido] = useState<TPedido | null>(null)
  const [detalles, setDetalles] = useState<TPedidoDetalle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const fetchData = async () => {
    if (!pedidoId) return
    const id = parseInt(pedidoId, 10)
    setLoading(true)
    try {
      const pedido = await GetPedidoDetailApi(null, id)
      setPedido(pedido)
      const descuentoGlobal = pedido?.descuento_adicional ?? 0;
      const lineas = await GetPedidoLineaListApi(null, id)

      const subtotalTotal = lineas.reduce((acc, linea) => acc + (linea.subtotal || 0), 0);

      const lineasSinDescuentos = lineas.map((linea) => {
        const cantidad = linea.cantidad || 1;
        const precioSinDescuentoUnitario = cantidad > 0
          ? linea.precio_unitario - linea.descuento / cantidad
          : linea.precio_unitario - linea.descuento;

        const proporcion = subtotalTotal > 0 ? (linea.subtotal || 0) / subtotalTotal : 0;
        const descuentoProrrateado = proporcion * descuentoGlobal;
        const descuentoUnitarioProrrateado = cantidad > 0 ? descuentoProrrateado / cantidad : 0;

        return {
          ...linea,
          pedido: 0,
          precio_unitario: precioSinDescuentoUnitario - descuentoUnitarioProrrateado,
        };
      });

      setDetalles(lineasSinDescuentos)
    } catch (error) {
      console.error("Error al cargar datos del pedido o sus líneas", error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [pedidoId])


  if (loading) return <p>Cargando datos del pedido...</p>

  return <FormNotaCreditoDebito edicion="nuevo" pedido={pedido} notaid={null} detalles={detalles}/>
}
