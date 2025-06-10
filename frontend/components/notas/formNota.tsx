'use client'

import { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import CustomButton from '../customButtom'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import { ChevronRight, ChevronDown } from 'lucide-react'
import ProductSearchPopup from '../popsearchproducto'
import { NotaCreditoDebitoTable } from './tableNota'
import { TProducto } from '@/components/types/productoTypes'
import { TPedido, TPedidoDetalle } from '../types/pedido'
import { GetPedidoDetailApi, PostPedidoAPI } from '@/api/pedidoApis'
import { formPedidoSchema, formPedidoSchemaSend, FormPedidoValues } from '../schemas/pedidoSchemas'
import { format } from 'date-fns'
import { cargarPedido } from '../pedidos/cargarPedido'
import { watch } from 'fs'
import { tipoComprobanteChoices } from '@/constants/tipoComprobanteChoices'
import { GetPedidoLineaListApi } from '@/api/pedidoDetalleApis'



type Props = {
  edicion: 'nuevo' | 'edicion';
  pedido: TPedido | null;
  notaid: number | null;
  detalles: TPedidoDetalle[] ;
}


export default function FormNotaCreditoDebito({edicion, pedido, notaid, detalles }: Props) {
  const form = useForm<FormPedidoValues>({
    resolver: zodResolver(formPedidoSchema),
    defaultValues: {
      id: '',    //s 
      fecha: '', //s back
      fechaentrega: '', 
      fecha_pago: '',
      serie: '',  //s back
      correlativo: '', //s back
      tipo_comprobante: tipoComprobanteChoices.TIPONCBOLETA, //s
      direccion: '', 
      cotizacion: '', //? puede ser null o puede ser la cotizacion del pedido pedido.cotizacion
      moneda: 'PEN', //s
      estado_pedido: 'anulado', //n
      monto_sin_impuesto: '0.00', //s
      monto_igv: '0.00', //s
      monto_total: '0.00', //s
      descuento_adicional: '0.00', 
      observaciones: '', //razon
      codigo_tipo_tributo: '1000',//no
      activo: '', //si 
      documento_relacionado: pedido? pedido.documento_relacionado: null,
    }
  })

  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)
  const [nota, setNota] = useState(null)
  const [listaDetalles, setListaDetalles] = useState<TPedidoDetalle[]>(detalles)
  const [pedidoRel, SetPedidodRel] = useState<TPedido | null>(pedido)
  

  //en el caso nuevo trae datos en pedido
  //en el caso edicion no trae esos datos pero ya tiene el pedido relacionado guardado
  useEffect(()=>{
    if(edicion==='edicion' && !pedido && notaid){
        GetPedidoDetailApi(null, notaid)
        .then(dataNota => {
          if(dataNota){
          cargarPedido(dataNota,form)//carga la nota , luego cargar su pedido  y las lineas de la nota
          if(dataNota.documento_relacionado){
            GetPedidoDetailApi(null, dataNota.documento_relacionado)
              .then(dataPedido => SetPedidodRel(dataPedido))
              .catch(error => console.log("no se pudo cargar el pedido relacionado"))
            GetPedidoLineaListApi(null,dataNota.id)
              .then(dataLista => setListaDetalles(dataLista))
              .catch(error => console.log("no se pudo cargar las lineas de la nota"))
              }
          }
        })
        .catch(error => console.error)
      }
  },[])

  const onSubmit = async (rawdata: FormPedidoValues) => {
    if(!pedidoRel)return
    console.log('Nota enviada:', rawdata)
    console.log('Detalles:', listaDetalles)
    rawdata.cotizacion = `${pedidoRel.cotizacion}`
    const data = formPedidoSchemaSend.parse(rawdata)
    if(data){
      if(edicion === 'nuevo'){
        PostPedidoAPI(null, data)//post de la nota
      }
      //si es edicion este boton no aparece
    }
  }


  return (
    <div className="container mx-auto px-4 py-6">
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ChevronRight size={16} />
            <span> Nota de Crédito / Débito </span>
            {edicion === 'nuevo' && (<CustomButton type="submit" >Guardar Nota</CustomButton>)}
          </div>

          
              <div className="grid grid-cols-2 gap-6">
                {pedidoRel && (
                <div className='space-y-2'>
                <Label> Serie y correlativo de Pedido relacionado</Label>
                <Input value={`${pedidoRel?.serie} - ${pedidoRel?.correlativo}`} disabled={true}/>
                </div>)
                }

                <FormField
                  control={form.control}
                  name="tipo_comprobante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Nota</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONCBOLETA} id="credito" />
                          <Label htmlFor="credito-boleta">Nota de credito a boleta</Label>
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONCFACTURA} id="debito" />
                          <Label htmlFor="credito-factura">Nota de credito a factura</Label>
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONDBOLETA} id="debito" />
                          <Label htmlFor="debito-boleta">Nota de debito a boleta</Label>
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONDFACTURA} id="debito" />
                          <Label htmlFor="debito-factura">Nota de debito a factura</Label>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="descuento_adicional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`Monto a corregir del descuento auxiliar`}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            
        </form>
      </Form>

      <div className="mt-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Detalle</h3>
          
        </div>

        <div className="bg-white rounded-lg border">
          <NotaCreditoDebitoTable
            detalles={listaDetalles ?? []}
            setDetalles={setListaDetalles}
            isDisabled = {false}
          />
        </div>
      </div>
    </div>
  )
}
