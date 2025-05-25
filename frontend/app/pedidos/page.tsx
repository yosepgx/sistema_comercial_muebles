"use client"

import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker } from '@mui/x-date-pickers';
import { FormControl, IconButton, InputLabel, MenuItem, Select } from "@mui/material";

import { GetPedidoListApi } from "@/api/pedidoApis"; 
import { useAuth } from "@/context/authContext"; 
import { ProtectedRoute } from "@/components/protectedRoute";
import MainWrap from "@/components/mainwrap";
import { TPedido } from "@/components/types/Pedido";
import { Edit, EyeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transformDateUTCHourToUserTime } from "@/components/transformDate";


const Columns: GridColDef<TPedido>[] = [
    {   field: 'id', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'fecha', 
        headerName: 'Fecha de creacion',
        resizable: false,
        flex: 1,
        valueFormatter: (value) => transformDateUTCHourToUserTime(value),

    },
    {   field: 'fechaentrega', 
        headerName: 'Fecha de entrega',
        resizable: false,
        flex: 1
    },
    {   field: 'fecha_pago', 
        headerName: 'Fecha de pago',
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
    {   field: 'direccion', 
        headerName: 'Direccion Entrega',
        resizable: false,
        flex: 1
    },
    {   field: 'cotizacion', 
        headerName: 'Codigo de Cotizacion',
        resizable: false,
        flex: 1
    },
    {   field: 'estado_pedido', 
        headerName: 'Estado Pedido',
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
    
    {   field: 'activo', 
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

    const [busquedaGeneral, setBusquedaGeneral] = useState("");

    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [campoFecha, setCampoFecha] = useState<"fecha" | "fechaentrega" | "fecha_pago">("fecha");

    const cargarDatos = async () => {
        try {
        const res = await GetPedidoListApi(ct)
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

    

    const fechaDentroDeRango = (fecha: Date | null | undefined) => {
    if (!fecha) return false;
    if (fechaInicio && fecha < fechaInicio) return false;
    if (fechaFin && fecha > fechaFin) return false;
    return true;
  };

  const filteredData = useMemo(() => {
  let result = [...data]; // Copia base

  // Filtro por búsqueda general
  if (busquedaGeneral.trim() !== "") {
  const texto = busquedaGeneral.trim().toLowerCase();
  result = result.filter(item => {
    const camposFiltrables = [
      item.id?.toString().toLowerCase(),
      item.estado_pedido?.toLowerCase(),
      item.direccion_entrega?.toLowerCase()
    ];
    return camposFiltrables.some(campo => campo?.includes(texto));
  });
  
  }

  // Filtro por rango de fechas
  if (fechaInicio || fechaFin) {
    result = result.filter((item) => {
      const fechaSeleccionada = item[campoFecha];
      if (!fechaSeleccionada) return false;
      const fechaDate = new Date(fechaSeleccionada);
      return fechaDentroDeRango(fechaDate);
    });
  }

  return result;
}, [data, busquedaGeneral, fechaInicio, fechaFin, campoFecha]);

    if (loading) {
    return <div>Cargando...</div>
    }
    return (
        <ProtectedRoute>
            <MainWrap>
                
                <div className="flex grid-cols-3 gap-8">
                  <div>
                  <Label>Buscador</Label>
                  <Input
                    value={busquedaGeneral}
                    onChange={(e) => setBusquedaGeneral(e.target.value)}
                    
                  />
                  </div> 
                <FormControl >
                  <InputLabel>Campo de fecha</InputLabel>
                  <Select
                    value={campoFecha}
                    onChange={(e) => setCampoFecha(e.target.value as any)}
                    label="Campo de fecha"
                  >
                    <MenuItem value="fecha">Fecha de Pedido</MenuItem>
                    <MenuItem value="fechaentrega">Fecha de Entrega</MenuItem>
                    <MenuItem value="fecha_pago">Fecha de Pago</MenuItem>
                  </Select>
                </FormControl>
                 <DatePicker
                  label="Desde"
                  value={fechaInicio}
                  onChange={(newValue) => setFechaInicio(newValue)}
                />
                <DatePicker
                  label="Hasta"
                  value={fechaFin}
                  onChange={(newValue) => setFechaFin(newValue)}
                />
                </div>
                <DataGrid
                rows = {filteredData? filteredData : []}
                columns={Columns}
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