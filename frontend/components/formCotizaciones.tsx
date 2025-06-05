'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { Eye, Edit, Trash2, ChevronRight, Printer } from 'lucide-react'
import { TCotizacion } from './types/cotizacion'
import {z} from 'zod'
import CustomButton from './customButtom'
import { useRouter } from 'next/navigation'
import { useOportunidadContext } from '@/context/oportunidadContext'
import { GetCotizacionListApi, handleDownload } from '@/api/cotizacionApis'


export default function FormCotizaciones() {
  const [tipoDireccion, setTipoDireccion] = useState<'tienda' | 'otro'>('tienda')
  const [direccion, setDireccion] = useState("")
  const [listaCotizaciones, setListaCotizaciones] =useState<TCotizacion[]>([])
  const {setCrrCotizacion, SetModoCotizacion, crrTab, crrOportunidad, setEdicionCotizacion} = useOportunidadContext()
  const router = useRouter();


  const columns: GridColDef<TCotizacion>[] = [
    {
      field: 'id',
      headerName: 'CODIGO',
      resizable: false,
      flex: 1
    },
    {
      field: 'fecha',
      headerName: 'FECHA DE CREACION',
      resizable: false,
      flex: 1
    },
    {
      field: 'estado_cotizacion',
      headerName: 'ESTADO',
      resizable: false,
      flex: 1
    },
    {
      field: 'oportunidad',
      headerName: 'OPORTUNIDAD',
      resizable: false,
      flex: 1
    },
    {
      field: 'direccion_entrega',
      headerName: 'DIRECCION',
      resizable: false,
      flex: 1
    },
    {
      field: 'monto_total',
      headerName: 'TOTAL',
      resizable: false,
      flex: 1
    },
    // {
    //   field: 'vendedor',
    //   headerName: 'VENDEDOR',
    //   resizable: false,
    //   flex: 1
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
        <div className="flex gap-1">
          <button className="p-1 rounded hover:bg-gray-100">
            <Eye onClick={()=>{setCrrCotizacion(params.row as TCotizacion); SetModoCotizacion('una'); setEdicionCotizacion('edicion');}}/>
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Trash2 />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Printer onClick={()=>{handleDownload(null,params.row.id)}}/>
          </button>
        </div>
      )
    }
  ]

  useEffect(()=>{
    if(crrOportunidad && crrTab === 'cotizaciones'){
      GetCotizacionListApi(null).then(
        data => {
          const filtradas = data.filter(item => item.oportunidad === crrOportunidad.id);
          setListaCotizaciones(filtradas);
        }
      )
    }
  },[crrTab])

  return (
    <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <ChevronRight size={16} />
            <span>Lista cotizaciones</span>
          </div>

          {/* Botón Nueva Cotización */}
          <div className="flex justify-end mb-4">
            <CustomButton type='button' variant='primary' onClick={()=>{setCrrCotizacion(null); SetModoCotizacion('una'); setEdicionCotizacion("nuevo");}}>
              Nueva Cotización
            </CustomButton>
          </div>

          {/* Tabla de cotizaciones */}
          <div className="bg-white rounded-lg border">
            <DataGrid
              rows={listaCotizaciones}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 }
                }
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
            />
          </div>
          
        <CustomButton variant="orange" type="button" 
          onClick={()=>{router.push('/'); localStorage.removeItem('nueva-oportunidad')}}>
          Salir
        </CustomButton>
          
      <style jsx global>{`
        .MuiDataGrid-root {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}