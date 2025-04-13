"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/table/dataTable"
import { columns, defaultColumnCell } from "./columns"
import { GetInventarioListApi, Inventario } from "./api/InventarioApis"

export default function InventarioPage() {
  const [data, setData] = useState<Inventario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await GetInventarioListApi()
        console.log("Datos cargados:", res)
        setData(res)
      } catch (error) {
        console.error("Error al cargar los datos", error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto">
      <DataTable
        columns={columns}
        odata={data}
        defaultColumn={defaultColumnCell}
      />
    </div>
  )
}