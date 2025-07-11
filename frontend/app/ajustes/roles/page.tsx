"use client"

import { GetRolListApi } from "@/api/rolesApis";
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { Trol } from "@/components/types/rolType";
import { PERMISSION_KEYS } from "@/constants/constantRoles";
import { useAuth } from "@/context/authContext";
import { usePermiso } from "@/hooks/usePermiso";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";

const userColumns: GridColDef<Trol>[] = [
    {   field: 'id', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'name', 
        headerName: 'Nombre de rol', 
        resizable: false,
        flex: 1
    },
    
];

export default function RolesPage(){
    const puedeGestionarRoles = usePermiso(PERMISSION_KEYS.CONFIGURAR_SISTEMA)
    const [data, setData] = useState<Trol[]>([])
    const [loading, setLoading] = useState(true)
    const {ct} = useAuth();
    const cargarDatos = async () => {
        try {
        const res = await GetRolListApi(ct)
        console.log("Datos cargados:", res)
        setData(res)
        } catch (error) {
        console.error("Error al cargar los datos", error)
        } finally {
        setLoading(false)
        }
    }
    useEffect(() => {
        cargarDatos()
    }, [])

    if (loading) {
    return <div>Cargando...</div>
    }

    return (
        <ProtectedRoute>
            <MainWrap>
                {puedeGestionarRoles && <>
                <h1 className="text-xl font-semibold mb-4">Roles</h1>
                <DataGrid
                rows = {data? data : []}
                columns={userColumns}
                initialState={{
                pagination: {
                    paginationModel: {
                    pageSize: 10,
                    },
                },
                
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                disableColumnMenu
                />
                </>}
            </MainWrap>
        </ProtectedRoute>
    )
}
