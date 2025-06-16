"use client"
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { DataTable } from "@/components/table/dataTable";
import { useEffect, useState } from "react";
import { columns } from "@/components/producto/columns";
import { useAuth } from "@/context/authContext";
import { GetProductoListApi } from "@/api/productoApis";
import { TProducto } from "@/components/types/productoTypes";
import { usePermiso } from "@/hooks/usePermiso";
import { PERMISSION_KEYS } from "@/constants/constantRoles";

export default function ProductoPage(){
    const puedeGestionarProducto = usePermiso(PERMISSION_KEYS.PRODUCTO_ACTUALIZAR)
    const [data, setData] = useState<TProducto[]>([])
    const [loading, setLoading] = useState(true)
    const {ct} = useAuth();
    useEffect(() => {
    const cargarDatos = async () => {
        try {
        const res = await GetProductoListApi(ct)
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

    return(
    <>
        <ProtectedRoute>
            <MainWrap>
                {puedeGestionarProducto && 
                <>
                <div>Productos</div>
                <DataTable
                    columns={columns}
                    odata={data}
                    placeholder={"Buscar por codigo, nombre o categoria de producto"}
                    canExport ={true}
                    canFilterActivo = {false}
                    canCreate = {true}
                    directionCreate="/inventario/producto/nuevo"
                ></DataTable>
                </>}
            </MainWrap>
        </ProtectedRoute>
    </>
    )
}