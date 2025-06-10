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

      const lineas = await GetPedidoLineaListApi(null, id)
      const lineasConValoresEnCero = lineas.map(linea => ({
        ...linea,
        cantidad: 0,
        precio_unitario: 0,
        descuento: 0,
        subtotal: 0,
      }))
      setDetalles(lineasConValoresEnCero)
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
