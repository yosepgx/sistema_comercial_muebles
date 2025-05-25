"use client"

import { GetClienteListApi } from "@/api/clienteApis";
import { GetRolListApi } from "@/api/rolesApis";
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { transformOnlyDate } from "@/components/transformDate";
import { TCliente } from "@/components/types/clienteType";
import { Trol } from "@/components/types/rolType";
import { useAuth } from "@/context/authContext";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";

const userColumns: GridColDef<TCliente>[] = [
    {   field: 'id', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'nombre', 
        headerName: 'Nombre/Razon',
        resizable: false,
        flex: 1
    },
    {   field: 'correo', 
        headerName: 'Email',
        resizable: false,
        flex: 1
    },
    {   field: 'telefono', 
        headerName: 'Telefono',
        resizable: false,
        flex: 1
    },
    {   field: 'tipo_interes', 
        headerName: 'Interes',
        resizable: false,
        flex: 1
    },
    {   field: 'fecha_conversion', 
        headerName: 'Fecha de conversion',
        resizable: false,
        flex: 1,
        valueFormatter: (value) => transformOnlyDate(value),
    },
    {   field: 'naturaleza', 
        headerName: 'Tipo de cliente',
        resizable: false,
        flex: 1
    },
    {   field: 'cod_dni', 
        headerName: 'DNI',
        resizable: false,
        flex: 1
    },
    {   field: 'cod_ruc', 
        headerName: 'RUC',
        resizable: false,
        flex: 1
    },
    {   field: 'activo', 
        headerName: 'Estado',
        resizable: false,
        flex: 1,
        valueFormatter: (value) => (value? "Activo" : "Inactivo"),
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


export default function ClientePage(){
    const [data, setData] = useState<TCliente[]>([])
    const [loading, setLoading] = useState(true)
    const {ct} = useAuth();
    const cargarDatos = async () => {
        try {
        const res = await GetClienteListApi(ct)
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