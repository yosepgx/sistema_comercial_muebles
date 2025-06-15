"use client"
import MainWrap from "@/components/mainwrap";
import { ProtectedRoute } from "@/components/protectedRoute";
import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker } from '@mui/x-date-pickers';
import { FormControl, IconButton } from "@mui/material";

import { useAuth } from "@/context/authContext";
import { Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TOportunidad } from "@/components/types/oportunidad";
import { GetOportunidadListApi, UpdateOportunidadAPI } from "@/api/oportunidadApis";
import CustomButton from "@/components/customButtom";
import { useRouter } from "next/navigation";
import { usePermiso } from "@/hooks/usePermiso";
import { PERMISSION_KEYS } from "@/constants/constantRoles";




export default function HomePage() {
  const puedeVerOportunidades = usePermiso(PERMISSION_KEYS.OPORTUNIDAD_LEER)
  const puedeEliminarOportunidades = usePermiso(PERMISSION_KEYS.OPORTUNIDAD_ELIMINAR)
  const puedeCrearOportunidades = usePermiso(PERMISSION_KEYS.OPORTUNIDAD_CREAR)
  const puedeEditarOportunidades = usePermiso(PERMISSION_KEYS.OPORTUNIDAD_ACTUALIZAR)

  const [data, setData] = useState<TOportunidad[]>([])
  const [loading, setLoading] = useState(true)
  const {ct} = useAuth();
  const router = useRouter()
  const [busquedaGeneral, setBusquedaGeneral] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);

  const Columns: GridColDef<TOportunidad>[] = [
    {   field: 'id', 
        headerName: 'Id',
        resizable: false,
        flex: 1
    },
    {   field: 'rcliente', 
        headerName: 'Documento de Cliente',
        resizable: false,
        flex: 1,
        valueFormatter: (value) => value? value: 'Cliente no asignado',
    },
    {   field: 'sede', 
        headerName: 'Sede',
        resizable: false,
        flex: 1
    },
    {   field: 'fecha_contacto', 
        headerName: 'Fecha de Contacto',
        resizable: false,
        flex: 1
    },
    
    {   field: 'estado_oportunidad', 
        headerName: 'Estado',
        resizable: false,
        flex: 1
    },
    {   field: 'rvalor_neto', 
        headerName: 'Valor Neto',
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
        <IconButton disabled={!puedeEditarOportunidades} onClick={() => {router.push(`/${params.row.id}`); 
        localStorage.removeItem('nueva-oportunidad');}}>
          <Edit />
        </IconButton>
        <IconButton disabled={!puedeEliminarOportunidades} onClick={() => {
          const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta oportunidad de venta?');
          if (confirmDelete) {
              const nuevo = { ...params.row, activo: false };
              UpdateOportunidadAPI(null, params.row.id, nuevo);
            }
          }}>
          <Trash2 />
        </IconButton>
      </div>
    ),
  }
];

  const cargarDatos = async () => {
        try {
        const res = await GetOportunidadListApi(null)
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
    ];
    return camposFiltrables.some(campo => campo?.includes(texto));
  });
  
  }

  // Filtro por rango de fechas
  if (fechaInicio || fechaFin) {
    result = result.filter((item) => {
      const fechaSeleccionada = item['fecha_contacto'];
      if (!fechaSeleccionada) return false;
      const fechaDate = new Date(fechaSeleccionada);
      return fechaDentroDeRango(fechaDate);
    });
  }
    return result;
  }, [data, busquedaGeneral, fechaInicio, fechaFin]);

  if (loading) {
  return <div>Cargando...</div>
  }

  return (
    <>
      <ProtectedRoute>
        <MainWrap>
          {puedeVerOportunidades && <>
            <div className="flex grid-cols-3 gap-8">
              <div>
              <Label>Buscador</Label>
              <Input
                value={busquedaGeneral}
                onChange={(e) => setBusquedaGeneral(e.target.value)}
                
              />
              </div> 
            <FormControl >
              
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
            <CustomButton type="button"
            onClick={()=>{router.push('/nuevo'); 
              localStorage.removeItem('nueva-oportunidad');
              }}>Nueva</CustomButton>
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
            </>}
        </MainWrap>
      </ProtectedRoute>
    </>
  );
}
