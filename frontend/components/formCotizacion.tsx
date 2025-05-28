'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { ChevronRight, ChevronDown, Edit, Printer, Trash2, Save } from 'lucide-react'
import { Form, useForm } from 'react-hook-form'
import {z} from 'zod';
import { TCotizacion, TCotizacionDetalle } from './types/cotizacion'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import CustomButton from './customButtom'

const productosData: TCotizacionDetalle[] = [
  {
    producto_id: 5,
    cotizacion_id: 1,
    cantidad: 1,
    precio: 2000,
    descuento: 200,
    nrolinea: 1,
    subtotal: 1800,
    activo: true,
    //rum: 'Unidades',
    //rproducto: 'Comedor de 8 sillas',
  },
  {
    producto_id: 6,
    cotizacion_id: 2,
    cantidad: 1,
    precio: 1800,
    descuento: 180,
    nrolinea: 2,
    subtotal: 1620,
    activo: true,
    //rum: 'Unidades',
    //rproducto: 'Comedor de 8 sillas',
  },
  {
    producto_id: 6,
    cotizacion_id: 3,
    cantidad: 1,
    precio: 2000,
    descuento: 200,
    nrolinea: 3,
    subtotal: 1800,
    activo: true,
    //rum: 'Unidades',
    //rproducto: 'Comedor de 8 sillas',
  },
]


const formSchema = z.object({
  producto_id: z.string(),
  cotizacion_id: z.string(),
  cantidad: z.string(),
  precio: z.string(),
  descuento: z.string(),
  subtotal: z.string(),
  nrolinea: z.string(),
  activo: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const formSchemaSend = formSchema.transform(data => ({
    ...data,
    producto_id: parseInt(data.producto_id,10),
    cotizacion_id: parseInt(data.cotizacion_id,10),
    cantidad: parseInt(data.cantidad,10),
    precio: parseInt(data.precio,10),
    descuento: parseInt(data.descuento,10),
    subtotal: parseInt(data.subtotal,10),
    nrolinea: parseInt(data.nrolinea,10), //TODO: asignar en orden
    activo: data.activo === "true",
  })
)

export default function FormCotizacionDetalle() {
  const [descuentoAuxiliar, setDescuentoAuxiliar] = useState('400.00')
  const [maximoPermisible, setMaximoPermisible] = useState('382.5')
  const [observaciones, setObservaciones] = useState('')
  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)
  const [data, setData] = useState<TCotizacionDetalle[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      producto_id: '0',
      cotizacion_id: '0',
      cantidad: '0',
      precio: '0',
      descuento: '0',
      subtotal: '0',
      nrolinea: '1',
      activo: 'true',
    }
  })

  useEffect(()=>{
    //llamada a api
    setData(productosData)
  },[])

  const columns: GridColDef[] = [
    {
      field: 'producto_id',
      headerName: 'CODIGO',
      resizable: false,
      flex: 1
    },
    // {
    //   field: 'rproducto',
    //   headerName: 'PRODUCTO',
    //   resizable: false,
    //   flex: 1
    // },
    {
      field: 'precio',
      headerName: 'VALOR UNITARIO',
      resizable: false,
      flex: 1
    },
    // {
    //   field: 'rum',
    //   headerName: 'UM',
    //   resizable: false,
    //   flex: 1
    // },
    {
      field: 'cantidad',
      headerName: 'CANTIDAD',
      resizable: false,
      flex: 1
    },
    {
      field: 'descuento',
      headerName: 'DESCUENTO',
      resizable: false,
      flex: 1
    },
    {
      field: 'subtotal',
      headerName: 'TOTAL',
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
        <div className="flex gap-1">
          <button className="p-1 rounded hover:bg-gray-100">
            <Edit/>
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Save/>
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Trash2/>
          </button>
        </div>
      )
    }
  ]

  const onSubmit = (data: FormValues) => {
    console.log('Datos del formulario:', data)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <ChevronRight size={16} />
        <span>lista cotizaciones/ cotizacion 1 (Propuesta)</span>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Sección desplegable de Descuento y observaciones */}
      <Collapsible open={isDescuentoOpen} onOpenChange={setIsDescuentoOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 rounded-t-lg border hover:bg-gray-100">
          {isDescuentoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-medium">Descuento y observaciones</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Descuento auxiliar */}
            <FormField
              control = {form.control}
              name = "descuento"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Descuento auxiliar</FormLabel>
                  <FormControl>
                    <Input type = "number" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />

            {/* Máximo permisible */}
            <div className="space-y-2">
              <Label htmlFor="maximoPermisible" className="text-sm font-medium">
                Máximo permisible
              </Label>
              <Input
                id="maximoPermisible"
                value={maximoPermisible}
                disabled = {true}
              />
            </div>

            {/* Observación/Razón de rechazo */}
            {/* <FormField
              control = {form.control}
              name = "observaciones"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Observación/Razón de rechazo</FormLabel>
                  <FormControl>
                    <Input type = "number" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            /> */}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sección de Listado */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Listado</h3>
        
        {/* Botones de acción */}
        <div className="flex justify-between items-center mb-4">
          <CustomButton variant='primary'>
            Agregar Línea
          </CustomButton>
          <div className="flex gap-3">
            <CustomButton variant='red'>
              Rechazar Cotización
            </CustomButton>
            <CustomButton variant='green'>
              Generar Pedido
            </CustomButton>
          </div>
        </div>

        {/* Tabla de productos */}
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
      </div>
      </form>
    </Form>    
    </div>
  )
}