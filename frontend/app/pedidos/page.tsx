"use client"

import { GetRolListApi } from "@/api/rolesApis";
import MainWrap from "@/components/mainwrap"
import { ProtectedRoute } from "@/components/protectedRoute"
import { TCliente } from "@/components/types/clienteType";
import { Trol } from "@/components/types/rolType";
import { useAuth } from "@/context/authContext";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { TCotizacion } from "@/components/types/cotizacion";
import { TPedido } from "@/components/types/Pedido";

const userColumns: GridColDef<TPedido>[] = [
    {   field: 'id', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'fecha', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'fechaentrega', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'fecha_pago', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    // {   field: 'serie', 
    //     headerName: 'Id',
    //     resizable: false,
    //     flex: 1
    // },

    // {   field: 'correlativo', 
    //     headerName: 'Fecha de creacion',
    //     resizable: false,
    //     flex: 1
    // },
    // {   field: 'tipo_comprobante', 
    //     headerName: 'Estado',
    //     resizable: false,
    //     flex: 1
    // },
    {   field: 'direccion_entrega', 
        headerName: 'Validez',
        resizable: false,
        flex: 1
    },
    {   field: 'cotizacion_id', 
        headerName: 'Validez',
        resizable: false,
        flex: 1
    },
    {   field: 'estado_pedido', 
        headerName: 'Validez',
        resizable: false,
        flex: 1
    },
    {   field: 'monto_sin_impuesto', 
        headerName: 'Monto Sin Impuesto',
        resizable: false,
        flex: 1
    },
    {   field: 'monto_igv', 
        headerName: 'Monto Con IGV',
        resizable: false,
        flex: 1
    },
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


export default function PedidosPage(){
    const [data, setData] = useState<TPedido[]>([])
    const [loading, setLoading] = useState(true)
    const {ct} = useAuth();
    const cargarDatos = async () => {
        try {
        const res = await GetRolListApi(ct)
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