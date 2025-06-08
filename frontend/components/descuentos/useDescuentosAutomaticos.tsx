// hooks/useDescuentosAutomaticos.ts
import { useState, useCallback } from 'react'
import { TCotizacionDetalle } from '../types/cotizacion'
import { customFetch } from '../customFetch'

interface DescuentoCalculado {
  descuento_total: number
  subtotal: number
  descuentos_aplicados: Array<{
    tipo: string
    monto: number
    descripcion: string
  }>
}

export const useDescuentosAutomaticos = () => {
  const [loading, setLoading] = useState(false)

  const calcularDescuentoLinea = useCallback(async (
    productoId: number,
    cantidad: number,
    precioUnitario: number
  ): Promise<DescuentoCalculado | null> => {
    setLoading(true)
    try {
      const response = await customFetch(null,'/api/calcular-descuentos-linea/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto_id: productoId,
          cantidad: cantidad,
          precio_unitario: precioUnitario
        })
      })

      if (!response.ok) {
        throw new Error('Error al calcular descuentos')
      }

      //devuelve
      // ({
      //     'descuento_total': float(descuento_total),
      //     'subtotal': float(subtotal_con_descuento),
      //     'descuentos_aplicados': descuentos_aplicados, //[]
      //     'precio_unitario': float(precio_unitario),
      //     'cantidad': cantidad //int
      // })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error calculando descuentos:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const aplicarDescuentosADetalle = useCallback(async (
    detalle: TCotizacionDetalle
  ): Promise<TCotizacionDetalle> => {
    const descuentoData = await calcularDescuentoLinea(
      detalle.producto,
      detalle.cantidad,
      detalle.precio_unitario
    )

    if (descuentoData) {
      return {
        ...detalle,
        descuento: descuentoData.descuento_total,
        subtotal: descuentoData.subtotal,
        // Opcional: guardar info de descuentos aplicados
        //descuentos_aplicados: descuentoData.descuentos_aplicados
      }
    }

    return detalle
  }, [calcularDescuentoLinea])

  const recalcularDescuentosLista = useCallback(async (
    listaDetalles: TCotizacionDetalle[]
  ): Promise<TCotizacionDetalle[]> => {
    const detallesConDescuento = await Promise.all(
      listaDetalles.map(detalle => aplicarDescuentosADetalle(detalle))
    )
    return detallesConDescuento
  }, [aplicarDescuentosADetalle])

  return {
    calcularDescuentoLinea,
    aplicarDescuentosADetalle,
    recalcularDescuentosLista,
    loading
  }
}