'use client'

import { useState } from 'react'
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

/*const formSchema = z.object({
  id: z.string(),
  validez: z.string(),
  monto_sin_impuesto: z.string(),
  monto_igv: z.string(),
  monto_total: z.string(),
  descuento_adicional: z.string(),
  activo: z.string(),
  fecha: z.string(), //creacion manejada por back
  estado_cotizacion: z.enum(["propuesta","aceptada","rechazada"]),
  observaciones: z.string(),
  direccion_entrega: z.string(),
  //falta oportunidad
  //cliente_id: z.number(),
  //sede_id: z.number(),
  //vendedor_asignado: z.number(),
})

type FormValues = z.infer<typeof formSchema>

const formSchemaSend = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    validez: parseInt(data.validez, 10),
    monto_sin_impuesto: parseInt(data.monto_sin_impuesto),
    monto_igv: parseInt(data.monto_igv),
    monto_total: parseInt(data.monto_total),
    descuento_adicional: parseInt(data.descuento_adicional),
    activo: data.activo === "true",
  })
)*/



export default function FormCotizaciones() {
  const [tipoDireccion, setTipoDireccion] = useState<'tienda' | 'otro'>('tienda')
  const [direccion, setDireccion] = useState("")
  const [data, setData] =useState<TCotizacion[]>([])
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
    // {
    //   field: 'oportunidad',
    //   headerName: 'OPORTUNIDAD',
    //   resizable: false,
    //   flex: 1
    // },
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
          <button className="p-1 rounded hover:bg-gray-100" onClick={()=>router.push(`/${params.row.id}`)}>
            <Eye />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Trash2 />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Printer />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <ChevronRight size={16} />
            <span>lista cotizaciones</span>
          </div>

          {/* Sección de dirección de entrega */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-4">Dirección de entrega</h3>
            <RadioGroup
              value={tipoDireccion}
              onValueChange={(value: 'tienda' | 'otro') => setTipoDireccion(value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tienda" id="tienda" />
                <Label htmlFor="tienda" className="text-sm">Tienda</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="otro" id="otro" />
                <Label htmlFor="otro" className="text-sm">Otro</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Botón Nueva Cotización */}
          <div className="flex justify-end mb-4">
            <CustomButton variant='primary' onClick={()=>{router.push('/nuevo')}}>
              Nueva Cotización
            </CustomButton>
          </div>

          {/* Tabla de cotizaciones */}
          <div className="bg-white rounded-lg border">
            <DataGrid
              rows={data}
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