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
import { useOportunidadContext } from '@/context/oportunidadContext'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { GetCotizacionLineaListApi } from '@/api/cotizacionDetalleApis'

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

/*
const formSchema = z.object({
  producto_id: z.string(),
  cotizacion_id: z.string(),
  cantidad: z.string(),
  precio: z.string(),
  descuento: z.string(),
  subtotal: z.string(),
  nrolinea: z.string(),
  activo: z.string(),
})*/



/*const formSchemaSend = formSchema.transform(data => ({
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
)*/


const formSchema = z. object({
  id: z.string(),     //manejado por back
  fecha: z.string(), //manejado por back 
  estado_cotizacion: z.enum(["propuesta","aceptada","rechazada"]), // si usa el boton de aceptar o rechazar 
  //vendedor_asignado: z.number(),
  monto_sin_impuesto: z.string(), //suma ingresada al final
  monto_igv: z.string(),
  monto_total: z.string(),
  descuento_adicional: z.string(),
  observaciones: z.string(),
  direccion_entrega: z.string(),
  activo: z.string(),

})

const formSchemaSend = formSchema.transform ( data => ({
  ...data,
  id: parseInt(data.id,10),
  monto_sin_impuesto: parseInt(data.monto_sin_impuesto,10),
  monto_igv: parseInt(data.monto_sin_impuesto,10),
  monto_total: parseInt(data.monto_sin_impuesto,10),
  descuento_adicional: parseInt(data.monto_sin_impuesto,10),
  activo: data.activo==='true',
  //vendedor_asignado = 1, //TODO: funcionalidades de asignar vendedor
  
}))
type FormValues = z.infer<typeof formSchema>

export default function FormCotizacionDetalle() {
  const [descuentoAuxiliar, setDescuentoAuxiliar] = useState('400.00')
  const [maximoPermisible, setMaximoPermisible] = useState('382.5')
  const [observaciones, setObservaciones] = useState('')
  const [tipoDireccion, setTipoDireccion] = useState<'tienda' | 'otro'>('tienda')
  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)
  const {crrCotizacion, crrTab, SetModoCotizacion} = useOportunidadContext()
  const [listaDetalles, setListaDetalles] = useState<TCotizacionDetalle[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      id: '',
      fecha: '',
      estado_cotizacion: 'propuesta',
      monto_sin_impuesto: '',
      monto_igv: '',
      monto_total: '',
      descuento_adicional: '',
      observaciones: '',
      direccion_entrega: '',
      activo: '',
    }
  })

  useEffect(()=>{
    if(crrCotizacion && crrTab === 'cotizaciones'){
      GetCotizacionLineaListApi(null, crrCotizacion.id)
      setListaDetalles(productosData)
    }
  },[crrTab])

  const columns: GridColDef<TCotizacionDetalle>[] = [
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
    //   flex: 1,
    //   renderCell: (params) => (
    //     <span>{params.row.rproducto?.nombre || ''}</span>
    //   ), // Maneja nulos o undefined
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
        <span onClick={()=>SetModoCotizacion('muchas')} 
        className="text-blue-600 hover:underline cursor-pointer">
          Lista cotizaciones /
          </span>
        <span> Cotización{' '}
        {crrCotizacion ? `${crrCotizacion.id} (${crrCotizacion.estado_cotizacion})` : '0 (Propuesta)'} </span>
        <CustomButton>Guardar Cotizacion</CustomButton>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Sección desplegable de Descuento y observaciones */}
      <Collapsible open={isDescuentoOpen} onOpenChange={setIsDescuentoOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 rounded-t-lg border hover:bg-gray-100">
          {isDescuentoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-medium">Datos generales</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Descuento auxiliar */}
            <div>
              <div className='flex flex-row'> 
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

              <FormField
                control = {form.control}
                name = "direccion_entrega"
                render={({field}) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel> Direccion de Entrega</FormLabel>
                    <FormControl>
                      <Input type = "number" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                  </FormItem>
                )}
              />
              </div>

              <FormField
                control = {form.control}
                name = "descuento_adicional"
                render={({field}) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel> Monto de Descuento Auxiliar</FormLabel>
                    <FormControl>
                      <Input type = "number" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                  </FormItem>
                )}
              />
            </div>
            {/* Máximo permisible */}
            <div className="space-y-2">
              <Label>
                Máximo permisible
              </Label>
              <Input
                id="maximoPermisible"
                value={maximoPermisible}
                disabled = {true}
              />
            </div>

            {/* Direccion de entrega */}
            

            {/* Observación/Razón de rechazo */}
            <div>
            <FormField
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
            />
            </div>
            <div>
              <div className="space-y-2">
              <Label>
                Valor Total
              </Label>
              <Input
                id="valorTotal"
                value={maximoPermisible}
                disabled = {true}
              />
              </div>

              <div className="space-y-2">
              <Label>
                Monto Gravado
              </Label>
              <Input
                id="montoGravado"
                value={maximoPermisible}
                disabled = {true}
              />
              </div>

              <div className="space-y-2">
              <Label>
                IGV
              </Label>
              <Input
                id="igv"
                value={maximoPermisible}
                disabled = {true}
              />
              </div>

            </div>
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
          <div className="flex gap-8">
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
            rows={listaDetalles}
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