'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import CustomButton from './customButtom'
import { useRouter } from 'next/navigation'
import { TPedido, TPedidoDetalle } from './types/pedido'
import { useOportunidadContext } from '@/context/oportunidadContext'
import { GetCotizacionListApi } from '@/api/cotizacionApis'
import { GetPedidoDetailApi, GetXMLFile, UpdatePedidoAPI } from '@/api/pedidoApis'
import { TOportunidad } from './types/oportunidad'
import { GetPedidoLineaListApi } from '@/api/pedidoDetalleApis'
import {z} from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from './ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z. object({
  id: z.string(),     //manejado por back
  fecha: z.string(), //manejado por back
  fechaentrega: z.string(),
  fecha_pago: z.string(),
  serie: z.string().optional(), //debe de ser manejado por back
  correlativo: z.string().optional(), //debe de ser manejado por back
  tipo_comprobante: z.string(),
  direccion_entrega: z.string(),
  cotizacion: z.string(),
  moneda: z.enum(['PEN']),
  estado_pedido: z.enum(["pendiente","pagado","despachado", "anulado"]), 
  monto_sin_impuesto: z.string(), //suma ingresada al final
  monto_igv: z.string(),
  monto_total: z.string(),
  descuento_adicional: z.string(),
  observaciones: z.string(),
  codigo_tipo_tributo: z.string(),
  activo: z.string(),
})

const formSchemaSend = formSchema.transform ( data => ({
  ...data,
  id: parseInt(data.id,10),
  tipo_comprobante: parseInt(data.tipo_comprobante,10),
  cotizacion: parseInt(data.id, 10),
  monto_sin_impuesto: parseFloat(data.monto_sin_impuesto),
  monto_igv: parseFloat(data.monto_igv),
  monto_total: parseFloat(data.monto_total),
  descuento_adicional: parseFloat(data.descuento_adicional),
}))

export default function FormPedido() {
  const {crrTab, crrOportunidad} = useOportunidadContext()
  const [pedido, setPedido] = useState<TPedido | null>(null)
  const [listaDetalles, setListaDetalles] = useState<TPedidoDetalle[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',     
      fecha: '', 
      fechaentrega: '',
      fecha_pago: '',
      serie: '', 
      correlativo: '', 
      tipo_comprobante: '',
      direccion_entrega: '',
      cotizacion: '',
      moneda: 'PEN',
      estado_pedido: 'pendiente', 
      monto_sin_impuesto: '',
      monto_igv: '',
      monto_total: '',
      descuento_adicional: '',
      observaciones: '',
      codigo_tipo_tributo: '',
      activo: ''
    }
  })

  const fetchPedido = async (crrOportunidad: TOportunidad) => {
    const data = await GetCotizacionListApi(null);
    const filtradas = data.filter(item => item.oportunidad === crrOportunidad.id 
      && item.estado_cotizacion === 'aceptada' 
      && item.activo===true);
    const ultima = filtradas[-1]
    const pedidoFetch = await GetPedidoDetailApi(null, undefined, ultima.id)
    
    if(pedidoFetch && pedidoFetch.estado_pedido !== 'anulado'){
      setPedido(pedidoFetch);
      const listado = await GetPedidoLineaListApi(null, pedidoFetch.id)
      setListaDetalles(listado)
      return pedidoFetch 
    }
  }

  const cargarPedido = (pedido: TPedido) =>{
    form.setValue('id',`${pedido.id}`);
    form.setValue('fecha',pedido.fecha);
    form.setValue('fechaentrega',pedido.fechaentrega);
    form.setValue('fecha_pago',pedido.fecha_pago);
    form.setValue('serie',pedido.serie);
    form.setValue('correlativo',pedido.correlativo); 
    form.setValue('tipo_comprobante',pedido.tipo_comprobante); 
    form.setValue('direccion_entrega',pedido.direccion_entrega);
    form.setValue('cotizacion',`${pedido.cotizacion}`);
    form.setValue('moneda',pedido.moneda);
    form.setValue('estado_pedido',pedido.estado_pedido);
    form.setValue('monto_sin_impuesto',`${pedido.monto_sin_impuesto}`);
    form.setValue('monto_igv',`${pedido.monto_igv}`);
    form.setValue('monto_total',`${pedido.monto_total}`);
    form.setValue('descuento_adicional',`${pedido.descuento_adicional}`);
    form.setValue('observaciones',pedido.observaciones);
    form.setValue('codigo_tipo_tributo',pedido.codigo_tipo_tributo);
    form.setValue('activo',`${pedido.activo}`);
  }

  useEffect(()=>{
    if(crrOportunidad && crrTab === 'pedido'){
      fetchPedido(crrOportunidad).then(
        data => {if(data)cargarPedido(data)}
      )
    }
  },[crrTab])


  const router = useRouter()

  const columns: GridColDef<TPedidoDetalle>[] = [
    {
      field: 'producto',
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
      field: 'precio_unitario',
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
    
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Información del pedido en grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Primera columna */}
        <div className="space-y-4">
          <FormField
            control = {form.control}
            name = "id"
            render={({field}) => (
              <FormItem className='flex flex-col'>
                <FormLabel> Código de Pedido</FormLabel>
                <FormControl>
                  <Input type = "text" {...field}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
              </FormItem>
            )}
          />


          {/* <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Solicitante</Label>
            <Input
              value={formData.solicitante}
              className="bg-gray-100"
            />
          </div> */}
          
          <FormField
            control = {form.control}
            name = "descuento_adicional"
            render={({field}) => (
              <FormItem className='flex flex-col'>
                <FormLabel> Descuento auxiliar</FormLabel>
                <FormControl>
                  <Input type = "text" {...field}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
              </FormItem>
            )}
          />

          <FormField
            control = {form.control}
            name = "estado_pedido"
            render={({field}) => (
              <FormItem className='flex flex-col'>
                <FormLabel> Estado del Pedido</FormLabel>
                <FormControl>
                  <Input type = "text" {...field}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
              </FormItem>
            )}
          />

          
          {/* <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Estado</Label>
            <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
              <SelectTrigger className="bg-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Por validar">Por validar</SelectItem>
                <SelectItem value="Validado">Validado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

        

        {/* Segunda columna */}
        <FormField
          control = {form.control}
          name = "direccion_entrega"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Dirección de entrega</FormLabel>
              <FormControl>
                <Input type = "text" {...field}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />
        <FormField
          control = {form.control}
          name = "fecha"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Fecha del pedido</FormLabel>
              <FormControl>
                <Input type = "text" {...field}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />

        <FormField
          control = {form.control}
          name = "fecha"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Fecha del pedido</FormLabel>
              <FormControl>
                <Input type = "date" {...field}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />

          
          {/* <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Descuento total</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
              <Input
                value={formData.descuentoTotal}
                onChange={(e) => handleInputChange('descuentoTotal', e.target.value)}
                className="pl-8 bg-gray-100"
              />
            </div>
          </div> */}

        <FormField
          control = {form.control}
          name = "observaciones"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Observaciones</FormLabel>
              <FormControl>
                <Input type = "date" {...field}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />  
          
        </div>

        {/* Tercera columna */}
        <div className="space-y-4">
          <FormField
            control = {form.control}
            name = "monto_sin_impuesto"
            render={({field}) => (
              <FormItem className='flex flex-col'>
                <FormLabel> Monto Gravado</FormLabel>
                <FormControl>
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                  <Input type = "date" {...field}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
              </FormItem>
            )}
          />

          <FormField
            control = {form.control}
            name = "monto_igv"
            render={({field}) => (
              <FormItem className='flex flex-col'>
                <FormLabel> Monto IGV</FormLabel>
                <FormControl>
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                  <Input type = "date" {...field}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
              </FormItem>
            )}
          />
          
          <FormField
            control = {form.control}
            name = "monto_total"
            render={({field}) => (
              <FormItem className='flex flex-col'>
                <FormLabel> Monto Total</FormLabel>
                <FormControl>
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                  <Input type = "date" {...field}/>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
              </FormItem>
            )}
          />

          {/* Botones de acción */}
          <div className="flex flex-row gap-8">
            {pedido && <CustomButton variant='primary'
            onClick={()=>GetXMLFile(null,pedido.id)}
            >
              Generar archivo XML
            </CustomButton>}
            
            {pedido?.estado_pedido === 'pendiente' && (
              <CustomButton
                variant='green'
                onClick={async () => {
                  const confirmacion = window.confirm('¿Deseas marcar el pedido como PAGADO?');
                  if (confirmacion) {
                    const nuevopedido = { ...pedido, estado_pedido: 'pagado' as const };
                    await UpdatePedidoAPI(null, nuevopedido.id, nuevopedido);
                    setPedido(nuevopedido);
                  }
                }}
              >
                Marcar como Pagado
              </CustomButton>
            )}

            {pedido?.estado_pedido === 'pagado' && (
              <CustomButton
                variant='green'
                onClick={async () => {
                  const confirmacion = window.confirm('¿Deseas marcar el pedido como DESPACHADO?');
                  if (confirmacion) {
                    const nuevopedido = { ...pedido, estado_pedido: 'despachado' as const };
                    await UpdatePedidoAPI(null, nuevopedido.id, nuevopedido);
                    setPedido(nuevopedido);
                  }
                }}
              >
                Marcar como Despachado
              </CustomButton>
            )}
            <CustomButton
              variant='red'
              onClick={async () => {
                const confirmacion = window.confirm('¿Deseas ANULAR el pedido?')
                if (confirmacion) {
                  if(pedido){
                    const nuevopedido = {...pedido, estado_pedido: 'anulado' as const};
                    await UpdatePedidoAPI(null,nuevopedido.id, nuevopedido)
                    setPedido(nuevopedido)
                  }
                }
              }}
            >
              Anular Pedido
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Sección RESUMEN PRODUCTOS */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">RESUMEN PRODUCTOS</h3>
        
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

      <CustomButton variant="orange" type="button" 
        onClick={()=>{router.push('/'); localStorage.removeItem('nueva-oportunidad')}}>
        Salir
      </CustomButton>
    </div>
    
  )
}