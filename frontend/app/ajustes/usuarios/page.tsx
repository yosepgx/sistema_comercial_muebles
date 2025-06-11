"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { useEffect, useState } from "react"
import { GetUsuarioListApi, UpdateUsuarioAPI } from "../../../api/usuarioApis"
import { Tusuario } from "@/components/types/usuarioType"
import { useAuth } from "@/context/authContext"
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconButton } from "@mui/material"
import { Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import CustomButton from "@/components/customButtom"
import { usePermiso } from "@/hooks/usePermiso"
import { PERMISSION_KEYS } from "@/constants/constantRoles"




export default function UsuariosPage(){
    const puedeGestionarUsuarios = usePermiso(PERMISSION_KEYS.USUARIO_ACTUALIZAR)
    const [data, setData] = useState<Tusuario[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const cargarDatos = async () => {
        try {
        const res = await GetUsuarioListApi(null)
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
        <IconButton onClick={() => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
        if (confirmDelete) {
            const nuevo = { ...params.row, is_active: false };
            UpdateUsuarioAPI(null, params.row.id, nuevo);
        }
        }}>
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
                {puedeGestionarUsuarios && <>
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
                </>}
            </MainWrap>
        </ProtectedRoute>
    )
}