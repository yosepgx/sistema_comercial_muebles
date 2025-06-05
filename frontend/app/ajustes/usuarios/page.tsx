"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { useEffect, useState } from "react"
import { GetUsuarioListApi } from "../../../api/usuarioApis"
import { Tusuario } from "@/components/types/usuarioType"
import { useAuth } from "@/context/authContext"
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconButton } from "@mui/material"
import { Edit, EyeIcon, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import CustomButton from "@/components/customButtom"




export default function UsuariosPage(){
    const [data, setData] = useState<Tusuario[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const {ct} = useAuth();
    const cargarDatos = async () => {
        try {
        const res = await GetUsuarioListApi(ct)
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

    const userColumns: GridColDef<Tusuario>[] = [
    {   field: 'id', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'username', 
        headerName: 'Nombre de usuario', 
        resizable: false,
        flex: 1
    },
    {   field: 'email', 
        headerName: 'Email', 
        resizable: false,
        flex: 1
    },
    {   field: 'groups', 
        headerName: 'Grupo', 
        resizable: false,
        flex: 1
    },
    {   field: 'is_active', 
        headerName: 'Activo', 
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
        <IconButton onClick={() => router.push(`/ajustes/usuarios/${params.row.id}`)}>
          <Edit />
        </IconButton>
        <IconButton >
          <Trash2 />
        </IconButton>
      </div>
    ),
  }
];

    if (loading) {
    return <div>Cargando...</div>
    }


    return (
        <ProtectedRoute>
            <MainWrap>
                <div className="flex justify-end mb-4">
                <CustomButton type='button' variant='primary' onClick={()=>{router.push('/ajustes/usuarios/nuevo')}}>
                    Nuevo Usuario
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