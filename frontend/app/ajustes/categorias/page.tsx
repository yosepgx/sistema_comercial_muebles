"use client"


import { GetCategoriaListApi, UpdateCategoriaAPI } from "@/api/categoriaApis";
import { TCategoria } from "@/app/inventario/producto/types/productoTypes";
import CustomButton from "@/components/customButtom";
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { useAuth } from "@/context/authContext";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Trash2 } from "lucide-react";
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
            <IconButton onClick={() => {
                const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta categoría?');
                if (confirmDelete) {
                    const nuevo = { ...params.row, activo: false };
                    UpdateCategoriaAPI(null, params.row.id, nuevo);
                }
            }}>
            <Trash2 />
            </IconButton>
        </div>
        ),
    }
    ];

    return (
        <ProtectedRoute>
            <MainWrap>
                <div className="flex justify-end mb-4">
                <CustomButton type='button' variant='primary' onClick={()=>{router.push('/ajustes/categorias/nuevo')}}>
                    Nueva Categoría
                </CustomButton>
                </div>
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