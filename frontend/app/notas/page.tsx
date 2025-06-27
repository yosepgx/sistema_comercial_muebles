"use client"

import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker } from '@mui/x-date-pickers';
import { FormControl, IconButton, InputLabel, MenuItem, Select } from "@mui/material";

import { descargarPedidosAPI, GetPedidoListApi } from "@/api/pedidoApis"; 
import { useAuth } from "@/context/authContext"; 
import { ProtectedRoute } from "@/components/protectedRoute";
import MainWrap from "@/components/mainwrap";
import { TPedido } from "@/components/types/pedido";
import { Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transformDateUTCHourToUserTime } from "@/components/transformDate";
import { useRouter } from "next/navigation";
import {format} from 'date-fns'
import CustomButton from "@/components/customButtom";
import { usePermiso } from "@/hooks/usePermiso";
import { PERMISSION_KEYS } from "@/constants/constantRoles";

export default function PedidosPage(){
    const puedeVerNotas = usePermiso(PERMISSION_KEYS.PEDIDO_LEER_TODOS)
    const puedeExportarNotas = usePermiso(PERMISSION_KEYS.COTIZACION_EXPORTAR)
    const [data, setData] = useState<TPedido[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const {ct} = useAuth();

    const [busquedaGeneral, setBusquedaGeneral] = useState("");

    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [campoFecha, setCampoFecha] = useState<"fecha" | "fechaentrega" | "fecha_pago">("fecha");

    const cargarDatos = async () => {
        try {
        let res = await GetPedidoListApi(ct)
        res = res.filter(value => value.tipo_comprobante !== 'boleta' && value.tipo_comprobante !== 'factura')
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
      item.direccion?.toLowerCase(),
      item.serie?.toLowerCase(),
      item.correlativo?.toLowerCase(),
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

  const Columns: GridColDef<TPedido>[] = [
      
      {   field: 'fecha', 
          renderHeader: () => (
            <span className="text-center block">
              Fecha de <br /> creacion
            </span>
          ), 
          resizable: false,
          flex: 1,
          valueFormatter: (value) => transformDateUTCHourToUserTime(value),

      },
      
      {   field: 'serie', 
          headerName: 'Serie',
          resizable: false,
          flex: 1
      },

      {   field: 'correlativo', 
          headerName: 'Correlativo',
          resizable: false,
          flex: 1
      },
      {   field: 'tipo_comprobante', 
          renderHeader: () => (
            <span className="text-center block">
              Tipo de <br /> Documento
            </span>
          ),
          resizable: false,
          flex: 1
      },
      
      {
          field: 'serie_correlativo',
          headerName: 'Serie - Correlativo',
          renderHeader: () => (
            <span className="text-center block">
              Codigo de <br /> Pedido
            </span>
          ),
          //renderCell: (params) => `${params.row.documento_referencia?params.row.documento_referencia.serie}-${params.row.documento_referencia.correlativo}`,
          renderCell: (params) => `${params.row.documento_referencia}`,
          resizable: false,
          flex: 1
        },
      
      // {   field: 'monto_total', 
      //     headerName: 'Monto Total',
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
          <IconButton onClick={() => router.push(`/notas/${params.row.id}`)}>
            <Edit />
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
                {puedeVerNotas && <>
                <h1 className="text-xl font-semibold mb-4">Notas de crédito</h1>
                <div className="flex flex-row space-x-8 mb-4">
                  <div className="flex-1 flex items-center">
                  <Input
                    className="w-full"
                    placeholder="Buscar por cualquier campo"
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
                    <MenuItem value="fecha">Fecha de Pedido</MenuItem>
                    <MenuItem value="fechaentrega">Fecha de Entrega</MenuItem>
                    <MenuItem value="fecha_pago">Fecha de Pago</MenuItem>
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
                
                </div>
                <DataGrid
                className="mt-2"
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
                </>}
            </MainWrap>
        </ProtectedRoute>
    )
}