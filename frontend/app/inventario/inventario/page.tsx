"use client"

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/dataTable";
import { columns, defaultColumnCell } from "@/components/inventario/columns";
import { GetInventarioListApi, Inventario } from "@/api/InventarioApis";
import { ProtectedRoute } from "@/components/protectedRoute";
import { useAuth } from "@/context/authContext";
import MainWrap from "@/components/mainwrap";
import { usePermiso } from "@/hooks/usePermiso";
import { PERMISSION_KEYS } from "@/constants/constantRoles";

export default function InventarioPage() {
  const puedeGestionarInventario = usePermiso(PERMISSION_KEYS.INVENTARIO_ACTUALIZAR)
  const [data, setData] = useState<Inventario[]>([])
  const [loading, setLoading] = useState(true)
  const [allData, setAllData] = useState<Inventario[]>([])
  const {ct} = useAuth();
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log("el valor del token ahora es: ", ct)
        const res = await GetInventarioListApi(ct)
        console.log("Datos cargados:", res)
        setData(res)
        setAllData(res)
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
    <>
    <ProtectedRoute>
      <MainWrap>
        {puedeGestionarInventario && 
        <div>
            <div className="container mx-auto">
            <DataTable
                columns={columns}
                odata={data}
                defaultColumn={defaultColumnCell}
                placeholder={"Buscar por nombre o codigo de producto"}
                canFilterActivo = {false}
                canExport = {true}
            >
            
            </DataTable>
            </div>
        </div>
        }
      </MainWrap>
    </ProtectedRoute>
    </>
  )
}