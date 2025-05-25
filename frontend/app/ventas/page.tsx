"use client"

import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { useAuth } from "@/context/authContext";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { TOportunidad } from "@/components/types/oportunidad";
import { GetOportunidadListApi } from "@/api/oportunidadApis";

const userColumns: GridColDef<TOportunidad>[] = [
    {   field: 'id', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'contacto', 
        headerName: 'Contacto',
        resizable: false,
        flex: 1
    },
    {   field: 'sede_id', 
        headerName: 'Sede',
        resizable: false,
        flex: 1
    },
    {   field: 'fecha_contacto', 
        headerName: 'Fecha de contacto',
        resizable: false,
        flex: 1
    },
    {   field: 'vendedor_asignado', 
        headerName: 'Vendedor Asignado',
        resizable: false,
        flex: 1
    },
    {   field: 'cliente_id', 
        headerName: 'Documento de cliente',
        resizable: false,
        flex: 1
    },
    {   field: 'activo', 
        headerName: 'Activo',
        resizable: false,
        flex: 1
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
        <IconButton onClick={() => console.log("Ver rol:", params.row)}>
          <EyeIcon />
        </IconButton>
        <IconButton onClick={() => console.log("edit rol:", params.row)}>
          <Edit />
        </IconButton>
      </div>
    ),
  }
];


export default function OportunidadesPage(){
    const [data, setData] = useState<TOportunidad[]>([])
    const [loading, setLoading] = useState(true)
    const {ct} = useAuth();
    const cargarDatos = async () => {
        try {
        const res = await GetOportunidadListApi(ct)
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