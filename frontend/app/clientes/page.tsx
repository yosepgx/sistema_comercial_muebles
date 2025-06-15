"use client"

import { GetClienteListApi, UpdateClienteAPI } from "@/api/clienteApis";
import CustomButton from "@/components/customButtom";
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { transformOnlyDate } from "@/components/transformDate";
import { TCliente } from "@/components/types/clienteType";
import { PERMISSION_KEYS } from "@/constants/constantRoles";
import { useAuth } from "@/context/authContext";
import { usePermiso } from "@/hooks/usePermiso";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";




export default function ClientePage(){
    const puedeVerClientes = usePermiso(PERMISSION_KEYS.CLIENTE_LEER)
    const puedeEditarCliente = usePermiso(PERMISSION_KEYS.CLIENTE_ACTUALIZAR)
    const puedeBorrarCliente = usePermiso(PERMISSION_KEYS.CLIENTE_ELIMINAR)
    const puedeCrearCLiente = usePermiso(PERMISSION_KEYS.CLIENTE_CREAR)
    const [data, setData] = useState<TCliente[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const cargarDatos = async () => {
        try {
        const res = await GetClienteListApi(null)
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
        {   field: 'documento', 
            headerName: 'DNI/RUC',
            resizable: false,
            flex: 1
        },
        {   field: 'tipo_documento', 
            headerName: 'Tipo de Documento',
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
            <IconButton disabled={!puedeEditarCliente} onClick={() => router.push(`/clientes/${params.row.id}`) }>
            <Edit />
            </IconButton>
            <IconButton disabled={!puedeBorrarCliente} onClick={() => {
            const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este cliente?');
            if (confirmDelete) {
                const nuevo = { ...params.row, activo: false };
                UpdateClienteAPI(null, params.row.id, nuevo);
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
                {puedeVerClientes && <>
                <div className="flex justify-end mb-4">
                {puedeCrearCLiente && <CustomButton type='button' variant='primary' onClick={()=>{router.push('/clientes/nuevo')}}>
                    Nuevo Cliente
                </CustomButton>}
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