"use client"


import { GetCategoriaListApi } from "@/api/categoriaApis";
import { GetRolListApi } from "@/api/rolesApis";
import { TCategoria } from "@/app/inventario/producto/types/productoTypes";
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { Trol } from "@/components/types/rolType";
import { useAuth } from "@/context/authContext";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, EyeIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export default function CategoriasPage(){
    const [data, setData] = useState<TCategoria[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const {ct} = useAuth();
    const cargarDatos = async () => {
        try {
        const res = await GetCategoriaListApi(ct)
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

    const userColumns: GridColDef<TCategoria>[] = [
        {   field: 'id', 
            headerName: 'Id',
            resizable: false,
            flex: 1
        },
        {   field: 'descripcion', 
            headerName: 'Descripcion', 
            resizable: false,
            flex: 1
        },
        {   field: 'activo', 
            headerName: 'Estado', 
            resizable: false,
            flex: 1,
            valueFormatter: (value) => (value? "Activo":"Inactivo"),
        },
        {
        field: 'acciones',
        headerName: 'Acciones',
        resizable: false,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 120,
        renderCell: (params) => (
        <div>
            <IconButton onClick={() => router.push(`/ajustes/categorias/${params.row.id}`)}>
            <Edit />
            </IconButton>
            <IconButton onClick={() => console.log("borrar rol:", params.row)}>
            <Trash2 />
            </IconButton>
        </div>
        ),
    }
    ];

    return (
        <ProtectedRoute>
            <MainWrap>
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
            </MainWrap>
        </ProtectedRoute>
    )
}