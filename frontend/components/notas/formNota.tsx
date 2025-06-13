'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import CustomButton from '../customButtom'
import { ChevronRight } from 'lucide-react'
import { NotaCreditoDebitoTable } from './tableNota'
import { TPedido, TPedidoDetalle } from '../types/pedido'
import { GetPedidoDetailApi, PostPedidoAPI } from '@/api/pedidoApis'
import { cargarPedido } from '../pedidos/cargarPedido'
import { tipoComprobanteChoices } from '@/constants/tipoComprobanteChoices'
import { GetPedidoLineaListApi } from '@/api/pedidoDetalleApis'
import { tipoNotaChoices } from '@/constants/tipoNotaChoices'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { UNIDADES_MEDIDA_BUSCA } from '@/constants/unidadesMedidaConstants'
import { usePermiso } from '@/hooks/usePermiso'
import { PERMISSION_KEYS } from '@/constants/constantRoles'
import { GetXMLNota, PostNotaAPI } from '@/api/notaApis'
import { useRouter } from 'next/navigation'
import { formNotaSchema, formNotaSchemaSend, FormNotaValues } from '../schemas/formNotaSchema'
import { TNota, TNotaDetalle } from '../types/nota'
import { cargarNota } from './cargarNota'



type Props = {
  edicion: 'nuevo' | 'edicion';
  pedido: TPedido | null;
  notaid: number | null;
  detalles: TPedidoDetalle[] ;
}


export default function FormNotaCreditoDebito({edicion, pedido, notaid, detalles }: Props) {
  const form = useForm<FormNotaValues>({
    resolver: zodResolver(formNotaSchema),
    defaultValues: {
      id: '',    //s 
      fecha: '', //s back
      fechaentrega: ''  , 
      fecha_pago: '',
      serie: '',  //s back
      correlativo: '', //s back
      tipo_comprobante: tipoComprobanteChoices.TIPONCBOLETA, //s
      tipo_nota: tipoNotaChoices.CTIPOANULACION,
      direccion: 'tienda', 
      cotizacion: '', //? puede ser null o puede ser la cotizacion del pedido pedido.cotizacion
      moneda: 'PEN', //s
      estado_pedido: 'anulado', //n
      monto_sin_impuesto: '0.00', //s
      monto_igv: '0.00', //s
      monto_total: '0.00', //s
      descuento_adicional: '0.00', 
      observaciones: '', //razon
      codigo_tipo_tributo: '1000',//no
      activo: 'true', //si 
      documento_referencia: pedido? pedido.documento_referencia: null,
    }
  })

  const puedeEditarPedidos = usePermiso(PERMISSION_KEYS.PEDIDO_CREAR)
  const [listaDetalles, setListaDetalles] = useState<TPedidoDetalle[]>(detalles)
  const [pedidoRel, SetPedidodRel] = useState<TPedido | null>(pedido)
  const router = useRouter()

  //en el caso nuevo trae datos en pedido
  //en el caso edicion no trae esos datos pero ya tiene el pedido relacionado guardado
  useEffect(()=>{
    if(edicion==='edicion' && !pedido && notaid){
        GetPedidoDetailApi(null, notaid)
        .then(dataNota => {
          if(dataNota){
          cargarNota(dataNota,form)//carga la nota , luego cargar su pedido  y las lineas de la nota
          if(dataNota.documento_referencia){
            GetPedidoDetailApi(null, dataNota.documento_referencia)
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
        field: 'precio_unitario',//-descuento/cantidad TODO: no puede haber descuento en ncs solo correcion
        headerName: 'Correcion Unitaria',
        resizable: false,
        flex: 1,
        
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
      // {
      //   field: 'descuento',
      //   headerName: 'DESCUENTO',
      //   resizable: false,
      //   flex: 1
      // },
      {
        field: 'subtotal',
        headerName: 'TOTAL',
        resizable: false,
        flex: 1
      },
      
    ]

  const onSubmit = async (rawdata: FormNotaValues) => {
    if(!pedidoRel )return
    if(!pedidoRel.id) return
    
    console.log('rel', pedidoRel)
    
    console.log('Detalles:', listaDetalles)
    rawdata.documento_referencia = pedidoRel.id
    rawdata.direccion = 'tienda'
    console.log('Nota enviada:', rawdata)
    const data = formNotaSchemaSend.parse(rawdata)
    const send = {...data, detalles: listaDetalles}//TODO: necesita su propio schema
    if(send){
      if(edicion === 'nuevo'){
        const result = await PostNotaAPI(null, data);
        if (result?.error && result?.code) {
          if (result.code.includes('NOTA_ERR')) {
              alert(result.message);
          } else {
              console.warn("Error inesperado", result.code);
          }
        }
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
            {edicion === 'nuevo' && <CustomButton type="submit" >Guardar Nota</CustomButton>}
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
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONCBOLETA} id="creditob" />
                          <Label htmlFor="credito-boleta">Nota de credito a boleta</Label>
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONCFACTURA} id="creditof" />
                          <Label htmlFor="credito-factura">Nota de credito a factura</Label>
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONDBOLETA} id="debitob" />
                          <Label htmlFor="debito-boleta">Nota de debito a boleta</Label>
                          <RadioGroupItem value={tipoComprobanteChoices.TIPONDFACTURA} id="debitof" />
                          <Label htmlFor="debito-factura">Nota de debito a factura</Label>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipo_nota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Nota</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="flex flex-col">
                          <RadioGroupItem value={tipoNotaChoices.CTIPOANULACION} id="tipoanul" />
                          <Label >Nota de credito a boleta</Label>
                          <RadioGroupItem value={tipoNotaChoices.CTIPOANULACIONRUC} id="tipoanul" />
                          <Label >Nota de credito a boleta</Label>
                          {/* <RadioGroupItem value={tipoNotaChoices.CTIPODECITEM} id="tipodesci" />
                          <Label >Nota de credito a factura</Label>
                          <RadioGroupItem value={tipoNotaChoices.CTIPODESCGLOBAL} id="tipodesg" />
                          <Label >Nota de debito a boleta</Label> */}
                          <RadioGroupItem value={tipoNotaChoices.CTIPODEVOLUCIONTOT} id="tipodevtot" />
                          <Label >Nota de debito a factura</Label>
                          {/* <RadioGroupItem value={tipoNotaChoices.DTIPOAUMENTOVALOR} id="tipoAumento" />
                          <Label >Nota de debito a factura</Label> */}
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
                {puedeEditarPedidos && edicion==='edicion' &&
                  <CustomButton type='button' variant='primary' 
                  onClick={()=>{if(notaid)GetXMLNota(null,notaid);}}
                  >Generar XML</CustomButton>
                }
              </div>
            
        </form>
      </Form>

      <div className="mt-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Detalle</h3>
          
        </div>

        <div className="bg-white rounded-lg border">
          <DataGrid
            rows={listaDetalles}
            columns={columns}
            getRowId={(row) => `${row.producto}-${row.cantidad}-${row.rum}`}
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
        onClick={()=>{router.push('/notas'); }}>
        Salir
      </CustomButton>
    </div>
  )
}
