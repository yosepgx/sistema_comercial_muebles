'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import CustomButton from '../customButtom'
import { useParams, useRouter } from 'next/navigation'
import { TPedido, TPedidoDetalle } from '../types/pedido'
import { useOportunidadContext } from '@/context/oportunidadContext'
import { GetCotizacionListApi } from '@/api/cotizacionApis'
import { GetPedidoDetailApi, GetXMLFile, UpdatePedidoAPI } from '@/api/pedidoApis'
import { TOportunidad } from '../types/oportunidad'
import { GetPedidoLineaListApi } from '@/api/pedidoDetalleApis'
import {z} from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {format} from  'date-fns'
import { UNIDADES_MEDIDA_BUSCA } from '@/constants/unidadesMedidaConstants'
import { pedidoSchema,pedidoSchemaSend, FormPedidoValues } from '../schemas/pedidoSchemas'

type Props = {
  tipo: 'nuevo' | 'edicion'
}

export default function FormPedidoStandAlone({tipo} : Props) {
  const [pedido, setPedido] = useState<TPedido | null>(null)
  const [descuentoTotal, setDescuentoTotal] = useState(0.0)
  const {id} = useParams();
  const router = useRouter();
  const [listaDetalles, setListaDetalles] = useState<TPedidoDetalle[]>([])
  const form = useForm<z.infer<typeof pedidoSchema>>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      id: '',     
      fecha: '', 
      fechaentrega: '',
      fecha_pago: '',
      serie: '', 
      correlativo: '', 
      tipo_comprobante: 'boleta',
      direccion: '',
      cotizacion: '',
      moneda: 'PEN',
      estado_pedido: 'pendiente', 
      monto_sin_impuesto: '0.00',
      monto_igv: '0.00',
      monto_total: '0.00',
      descuento_adicional: '0.00',
      observaciones: '',
      codigo_tipo_tributo: '1000',
      activo: ''
    }
  })


  const cargarPedido = (pedido: TPedido) =>{
    form.setValue('id',`${pedido.id}`);
    form.setValue('fecha',format(pedido.fecha, 'yyyy-MM-dd'));
    form.setValue('fechaentrega',format(pedido.fechaentrega, 'yyyy-MM-dd'));
    form.setValue('fecha_pago',format(pedido.fecha_pago, 'yyyy-MM-dd'));
    form.setValue('serie',pedido.serie);
    form.setValue('correlativo',pedido.correlativo); 
    form.setValue('tipo_comprobante',pedido.tipo_comprobante); 
    form.setValue('direccion',pedido.direccion);
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


  const fetchPedido = async () => {
      const pedido = await GetPedidoDetailApi(null, parseInt(id as string, 10))
      if(pedido){
          const listado = await GetPedidoLineaListApi(null, parseInt(id as string, 10))
          setPedido(pedido)
          setListaDetalles(listado)
          const desctotal = parseFloat((
            listado.reduce((acc, d) => acc + d.descuento, 0) + pedido.descuento_adicional
            ).toFixed(2));
          setDescuentoTotal(desctotal)
      }
      return pedido;
  }

  useEffect(()=>{
    if(tipo ==='edicion' && id){
      const cargar = async ()=>{
        const data = await fetchPedido();
        if(data)cargarPedido(data);
      }
      cargar();
    }
  },[tipo,id])
  

  //no hay boton de submit y no necesita de uno
  const onSubmit = async (data: FormPedidoValues) => {
    console.log('Datos del formulario:', data)
  }

  const columns: GridColDef<TPedidoDetalle>[] = [
    {
      field: 'producto',
      headerName: 'CODIGO',
      resizable: false,
      flex: 1
    },
    {
      field: 'rnombre',
      headerName: 'PRODUCTO',
      resizable: false,
      flex: 1,
      
    },
    {
      field: 'precio_unitario',
      headerName: 'VALOR UNITARIO',
      resizable: false,
      flex: 1
    },
    {
      field: 'rum',
      headerName: 'UM',
      resizable: false,
      flex: 1,
      valueFormatter: (value) => UNIDADES_MEDIDA_BUSCA[value]?? 'Sin unidad',
    },
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
      <Form {...form}> 
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Input type = "number" {...field} disabled={true}/>
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
                  <Input type = "number" {...field} disabled={true}/>
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
                  <Input type = "text" {...field} disabled={true}/>
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
          name = "direccion"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Dirección de entrega</FormLabel>
              <FormControl>
                <Input type = "text" {...field} disabled={true}/>
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
                <Input type = "date" {...field} disabled={true}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />

        <FormField
          control = {form.control}
          name = "fecha_pago"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Fecha de pago</FormLabel>
              <FormControl>
                <Input type = "date" {...field} disabled={true}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />

        <FormField
          control = {form.control}
          name = "fechaentrega"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Fecha de entrega</FormLabel>
              <FormControl>
                <Input type = "date" {...field} disabled={true}/>
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />

          
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Descuento total</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
              <Input
                value={descuentoTotal}
                disabled={true}
              />
            </div>
        </div>
          
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
                  <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                  <Input type = "number" {...field} className='pl-10' disabled={true}/>
                  </div>
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
                  <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                  <Input type = "number" {...field} className='pl-10' disabled={true}/>
                  </div>
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
                  <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                  <Input type = "number" {...field} className='pl-10'disabled={true}/>
                  </div>
                </FormControl>
                <FormMessage className="min-h-[24px]"/>
              </FormItem>
            )}
          />
          <FormField
          control = {form.control}
          name = "observaciones"
          render={({field}) => (
            <FormItem className='flex flex-col'>
              <FormLabel> Observaciones</FormLabel>
              <FormControl>
                <Input type = "text" {...field} />
              </FormControl>
              <FormMessage className="min-h-[24px]"/>
            </FormItem>
          )}
        />  

          {/* Botones de acción */}
          <div className="flex flex-row gap-8">
            {pedido && <CustomButton type='button' variant='primary'
            onClick={()=>GetXMLFile(null,pedido.id)}
            >
              Generar archivo XML
            </CustomButton>}
            
            {pedido?.estado_pedido === 'pendiente' && (
              <CustomButton
                type='button'
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
                type='button'
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
              type='button'
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
        </form>
      </Form>        
      {/* Sección RESUMEN PRODUCTOS */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">RESUMEN PRODUCTOS</h3>
        
        <div className="bg-white rounded-lg border">
          <DataGrid
            rows={listaDetalles}
            columns={columns}
            getRowId={(row) => `${row.pedido}-${row.producto}`}
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