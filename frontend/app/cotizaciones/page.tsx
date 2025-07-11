"use client"

import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { useAuth } from "@/context/authContext";
import { FormControl, IconButton, InputLabel, MenuItem, Select } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TCotizacion } from "@/components/types/cotizacion";
import { descargarCotizacionesAPI, GetCotizacionListApi, handleDownload, UpdateCotizacionAPI } from "@/api/cotizacionApis";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/customButtom";
import { format } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePermiso } from "@/hooks/usePermiso";
import { PERMISSION_KEYS } from "@/constants/constantRoles";

export default function CotizacionesPage(){
    const puedeCrearCotizaciones = usePermiso(PERMISSION_KEYS.COTIZACION_CREAR)
    const puedeVerCotizaciones = usePermiso(PERMISSION_KEYS.COTIZACION_LEER)
    const puedeEditarCotizaciones = usePermiso(PERMISSION_KEYS.COTIZACION_ACTUALIZAR)
    const puedeEliminarCotizaciones = usePermiso(PERMISSION_KEYS.COTIZACION_ELIMINAR)
    const puedeExportarCotizaciones = usePermiso(PERMISSION_KEYS.COTIZACION_EXPORTAR)

    const [data, setData] = useState<TCotizacion[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const {ct} = useAuth();
    const [busquedaGeneral, setBusquedaGeneral] = useState("");

    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [campoFecha, setCampoFecha] = useState<"fecha">("fecha");

    const cargarDatos = async () => {
        try {
        const res = await GetCotizacionListApi(ct)
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
      item.rcliente?.toLowerCase(),
      item.estado_cotizacion?.toLowerCase(),
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

    const userColumns: GridColDef<TCotizacion>[] = [
        {   field: 'id', 
            headerName: 'Id',
            resizable: false,
            flex: 1
        },
        {   field: 'oportunidad', 
            renderHeader: () => (
                <span className="text-center block">
                Oportunidad<br /> asociada
                </span>
            ),
            resizable: false,
            flex: 1
        },
        {
            field: 'rcliente', 
            headerName: 'Documento de cliente',
            renderHeader: () => (
                <span className="text-center block">
                Documento de<br /> cliente
                </span>
            ),
            resizable: false,
            flex: 1,
            valueFormatter: (value) => value? value: "Cliente no asignado"
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
        {   field: 'vendedor', 
            headerName: 'Vendedor',
            resizable: false,
            flex: 1
        },
        {   field: 'descuento_adicional', 
            headerName: 'Descuento auxiliar',
            resizable: false,
            flex: 1
        },
        {   field: 'direccion_entrega', 
            renderHeader: () => (
                <span className="text-center block">
                Direccion de<br /> entrega
                </span>
            ),
            resizable: false,
            flex: 1
        },
        // {   field: 'activo', 
        //     headerName: 'Activo',
        //     resizable: false,
        //     flex: 1
        // },
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
            <IconButton disabled={!puedeVerCotizaciones} onClick={() => router.push(`cotizaciones/${params.row.id}`)}>
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
                { puedeVerCotizaciones && <>
                <h1 className="text-xl font-semibold mb-4">Cotizaciones</h1>
                <div className="flex flex-row space-x-8 mb-4">
                    <div className="flex-1 flex items-center">
                    <Input
                    className="w-full"
                    placeholder="Buscar por campo"
                    value={busquedaGeneral}
                    onChange={(e) => setBusquedaGeneral(e.target.value)}
                    />
                    </div>
                <div>
                <FormControl >
                    <InputLabel>Campo de fecha</InputLabel>
                    <Select
                    value={campoFecha}
                    onChange={(e) => setCampoFecha(e.target.value as any)}
                    label="Campo de fecha"
                    >
                    <MenuItem value="fecha">Fecha de creacion</MenuItem>
                    </Select>
                </FormControl>
                </div>
                <div>
                <DatePicker
                    label="Desde"
                    value={fechaInicio}
                    onChange={(newValue) => setFechaInicio(newValue)}
                />
                </div>
                <div>
                <DatePicker
                    label="Hasta"
                    value={fechaFin}
                    onChange={(newValue) => setFechaFin(newValue)}
                />
                </div>
                {puedeExportarCotizaciones && 
                <CustomButton  type="button" onClick={()=>descargarCotizacionesAPI(null, 
                                  format(fechaInicio?? '01/01/2012', 'yyyy-MM-dd'), 
                                  format(fechaFin ?? '01/01/2040', 'yyyy-MM-dd'))
                                  }>
                                  Exportar
                </CustomButton>}
                </div>
                <DataGrid
                rows = {filteredData? filteredData : []}
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