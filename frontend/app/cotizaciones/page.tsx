"use client"

import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { useAuth } from "@/context/authContext";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Printer, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TCotizacion } from "@/components/types/cotizacion";
import { GetCotizacionListApi, handleDownload, UpdateCotizacionAPI } from "@/api/cotizacionApis";
import { useRouter } from "next/navigation";

export default function CotizacionesPage(){
    const [data, setData] = useState<TCotizacion[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const {ct} = useAuth();

    const cargarDatos = async () => {
        try {
        const res = await GetCotizacionListApi(ct)
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


    const userColumns: GridColDef<TCotizacion>[] = [
        {   field: 'id', 
            headerName: 'Id',
            resizable: false,
            flex: 1
        },
        {   field: 'fecha', 
            headerName: 'Fecha de creacion',
            resizable: false,
            flex: 1
        },
        {   field: 'estado_cotizacion', 
            headerName: 'Estado',
            resizable: false,
            flex: 1
        },
        
        // {   field: 'monto_sin_impuesto', 
        //     headerName: 'Monto Sin Impuesto',
        //     resizable: false,
        //     flex: 1
        // },
        // {   field: 'monto_igv', 
        //     headerName: 'Monto Con IGV',
        //     resizable: false,
        //     flex: 1
        // },
        {   field: 'monto_total', 
            headerName: 'Monto Total',
            resizable: false,
            flex: 1
        },
        {   field: 'descuento_adicional', 
            headerName: 'Descuento auxiliar',
            resizable: false,
            flex: 1
        },
        {   field: 'direccion_entrega', 
            headerName: 'Id',
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
            <IconButton onClick={() => router.push(`cotizaciones/${params.row.id}`)}>
            <Edit />
            </IconButton>
            {/* <IconButton onClick={() => {
            const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta cotizacion?');
            if (confirmDelete) {
                const nuevo = { ...params.row, activo: false };
                UpdateCotizacionAPI(null, params.row.id, nuevo);
            }
            }}>
            <Trash2 />
            </IconButton> */}
            <IconButton>
                <Printer onClick={()=>{handleDownload(null,params.row.id)}}/>
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