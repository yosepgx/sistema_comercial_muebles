'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { ChevronRight, ChevronDown, Edit, Printer, Trash2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {z} from 'zod';
import { TCotizacion, TCotizacionDetalle } from './types/cotizacion'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import CustomButton from './customButtom'
import { useOportunidadContext } from '@/context/oportunidadContext'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { GetCotizacionLineaListApi } from '@/api/cotizacionDetalleApis'
import { TProducto } from '@/app/inventario/producto/types/productoTypes'
import ProductSearchPopup from './popsearchproducto'


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
  const [maximoPermisible, setMaximoPermisible] = useState('0.00')
  const [tipoDireccion, setTipoDireccion] = useState<'tienda' | 'otro'>('tienda')
  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const {crrCotizacion, crrTab, SetModoCotizacion, tipoEdicion} = useOportunidadContext()
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
      GetCotizacionLineaListApi(null, crrCotizacion.id).then(
        data => setListaDetalles(data)
      )
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

  useEffect(() => {
  // Sumar subtotales
  const totalConIGV = listaDetalles.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const totalSinIGV = totalConIGV / 1.18; // Asumiendo 18% IGV
  const IGV = totalSinIGV * 0.18; // Asumiendo 18% IGV
  

  form.setValue('monto_sin_impuesto', totalSinIGV.toFixed(2));
  form.setValue('monto_igv', IGV.toFixed(2));
  form.setValue('monto_total', totalConIGV.toFixed(2));
}, [listaDetalles]);

  const onSubmit = (data: FormValues) => {
    console.log('Datos del formulario:', data)
    console.log('Datos del listado:', listaDetalles)
  }


const handleSelectProducto = (producto: TProducto) => {
  try {
    if(!crrCotizacion && tipoEdicion === 'nuevo')
    console.log("producto seleccionado", producto)
    setListaDetalles((old) => {
      const yaExiste = old.some(item => item.producto_id === producto.id);
      if (yaExiste) return old;

      const detalle: TCotizacionDetalle = {
        producto_id: producto.id,
        cotizacion_id: 0, //al crear asignar a todas estas la cotizacion
        cantidad: 1,
        precio: producto.rprecio_actual?producto.rprecio_actual:0 ,
        descuento: 0,
        subtotal: producto.rprecio_actual?producto.rprecio_actual * 1: 0,
        nrolinea: old.length + 1,
        activo: true
      };

      return [...old, detalle];
    });

    setIsSearchPopupOpen(false);
  } catch (error) {
    console.error('Error al seleccionar producto', error);
  }
};

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductSearchPopup
              open={isSearchPopupOpen}
              onClose={() => setIsSearchPopupOpen(false)}
              onSelectProducto={handleSelectProducto}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <ChevronRight size={16} />
        <span onClick={()=>SetModoCotizacion('muchas')} 
        className="text-blue-600 hover:underline cursor-pointer">
          Lista cotizaciones /
          </span>
        <span> Cotización{' '}
        {crrCotizacion ? `${crrCotizacion.id} (${crrCotizacion.estado_cotizacion})` : '0 (Propuesta)'} </span>
        <CustomButton type='submit'>Guardar Cotizacion</CustomButton>
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
          <div className="grid grid-cols-2 ">
            {/* Descuento auxiliar */}
            <div>
              <div className='flex flex-row gap-8' > 
              <RadioGroup
                value={tipoDireccion}
                onValueChange={(value: 'tienda' | 'otro') => setTipoDireccion(value)}
                className="flex flex-col "
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
                      <Input type = "text" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                  </FormItem>
                )}
              />
              </div>
              <div className='flex flex-row'>
                <FormField
                  control = {form.control}
                  name = "descuento_adicional"
                  render={({field}) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel> Monto de Descuento Auxiliar</FormLabel>
                      <FormControl>
                        <Input type = "number" {...field} className='flex'/>
                      </FormControl>
                      <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                  )}
                />
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
            </div>
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
            </div>
            {/* Máximo permisible */}
            

            {/* Direccion de entrega */}
            

            
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
      </form>
    </Form> 
      {/* Sección de Listado */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Listado</h3>
        
        {/* Botones de acción */}
        <div className="flex justify-between items-center mb-4">
          <CustomButton variant='primary'
          onClick={()=>setIsSearchPopupOpen(true)}>
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
      
        {/* Tabla de detalles */}
        <div className="bg-white rounded-lg border">
          <DataGrid
            rows={listaDetalles}
            columns={columns}
            getRowId={(row) => `${row.producto_id}-${row.cotizacion_id}`}
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
         
    </div>
  )
}