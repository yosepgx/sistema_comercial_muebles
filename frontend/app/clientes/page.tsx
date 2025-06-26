"use client"

import { GetClienteListApi, UpdateClienteAPI } from "@/api/clienteApis";
import CustomButton from "@/components/customButtom";
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { transformOnlyDate } from "@/components/transformDate";
import { TCliente } from "@/components/types/clienteType";
import { Input } from "@/components/ui/input";
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
    const [searchTerm, setSearchTerm] = useState('');
    
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

    // Filtrar clientes basado en el término de búsqueda
    const filteredClientes = data.filter(cliente =>
        String(cliente.id).includes(searchTerm.toLowerCase()) ||
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.naturaleza.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.tipo_interes.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clienteColumns: GridColDef<TCliente>[] = [
        {   field: 'id', 
            headerName: 'Id',
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
        // {   field: 'fecha_conversion', 
        //     headerName: 'Fecha de conversion',
        //     resizable: false,
        //     flex: 1,
        //     valueFormatter: (value) => transformOnlyDate(value),
        // },
        {   field: 'naturaleza', 
            headerName: 'Tipo de cliente',
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
                <h1 className="text-xl font-semibold mb-4">Clientes</h1>
                <div className="flex flex-row space-x-8 mb-4">
                <Input
                    placeholder="Buscar por nombre, documento, tipo cliente"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div >
                {puedeCrearCLiente && <CustomButton type='button' variant='primary' onClick={()=>{router.push('/clientes/nuevo')}}>
                    Nuevo Cliente
                </CustomButton>}
                </div>
                </div>
                <DataGrid
                rows = {filteredClientes? filteredClientes : []}
                columns={clienteColumns}
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