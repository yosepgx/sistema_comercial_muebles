"use client"

import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { useEffect, useState } from "react"
import { GetUsuarioListApi } from "../../../api/usuarioApis"
import { Tusuario } from "@/components/types/usuarioType"
import { useAuth } from "@/context/authContext"
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconButton } from "@mui/material"
import { Edit, EyeIcon } from "lucide-react"

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
        <IconButton onClick={() => handleView(params.row)}>
          <EyeIcon />
        </IconButton>
        <IconButton onClick={() => handleEdit(params.row)}>
          <Edit />
        </IconButton>
      </div>
    ),
  }
];

const handleView = (row: Tusuario) => {
  console.log("Ver usuario:", row);
  
  
};

const handleEdit = (row: Tusuario) => {
  console.log("Editar usuario:", row);
};

export default function UsuariosPage(){
    const [data, setData] = useState<Tusuario[]>([])
    const [loading, setLoading] = useState(true)
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

    if (loading) {
    return <div>Cargando...</div>
    }


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