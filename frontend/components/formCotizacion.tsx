'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TCotizacionDetalle } from './types/cotizacion'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import CustomButton from './customButtom'
import { useOportunidadContext } from '@/context/oportunidadContext'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { GetCotizacionLineaListApi, PostCotizacionLineaAPI } from '@/api/cotizacionDetalleApis'
import { TProducto } from '@/app/inventario/producto/types/productoTypes'
import ProductSearchPopup from './popsearchproducto'
import { CotizacionTable } from './tablecotizacion'
import { PostCotizacionAPI, UpdateCotizacionAPI } from '@/api/cotizacionApis'

//TODO: falta agregar nro de linea a cada detalle

const formSchema = z. object({
  id: z.string(),     //manejado por back
  fecha: z.string(), //manejado por back 
  estado_cotizacion: z.enum(["propuesta","aceptada","rechazada"]), // si usa el boton de aceptar o rechazar 
  //vendedor_asignado: z.number(),
  oportunidad: z.string(),
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
  oportunidad: parseInt(data.oportunidad,10),
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
  const {crrCotizacion, crrTab, SetModoCotizacion, tipoEdicion, crrOportunidad, setCrrTab,edicionCotizacion} = useOportunidadContext()
  const [listaDetalles, setListaDetalles] = useState<TCotizacionDetalle[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      id: '',
      fecha: '',
      estado_cotizacion: 'propuesta',
      oportunidad: '',
      monto_sin_impuesto: '0.00',
      monto_igv: '0.00',
      monto_total: '0.00',
      descuento_adicional: '0.00',
      observaciones: '',
      direccion_entrega: '',
      activo: 'true',
    }
  })

  useEffect(()=>{
    if(crrCotizacion && crrTab === 'cotizaciones'){
      GetCotizacionLineaListApi(null, crrCotizacion.id).then(
        data => setListaDetalles(data)
      )
    }
  },[crrTab])

  useEffect(() => {
  // Sumar subtotales
  const totalConIGV = listaDetalles.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const totalSinIGV = totalConIGV / 1.18; // Asumiendo 18% IGV
  const descuentoConIGV = Number(crrCotizacion?.descuento_adicional || 0 )
  const descuentoBase = descuentoConIGV/ 1.18
  const IGV = (totalSinIGV - descuentoBase)* 0.18; // Asumiendo 18% IGV
  
  form.setValue('monto_sin_impuesto', totalSinIGV.toFixed(2));
  form.setValue('monto_igv', IGV.toFixed(2));
  form.setValue('monto_total', totalConIGV.toFixed(2));
}, [listaDetalles]);

const onSubmit = async (rawdata: FormValues) => {
  console.log('Datos del formulario:', rawdata)
  console.log('Datos del listado:', listaDetalles)
  try {
    rawdata.oportunidad = `${crrOportunidad?.id}`
    if(tipoDireccion === 'tienda')rawdata.direccion_entrega = 'tienda';
    const data = formSchemaSend.parse(rawdata)
    if(!crrCotizacion && edicionCotizacion === 'nuevo'){
      //creacion de cotizacion
      const nuevaCotizacion = await PostCotizacionAPI(null, data)
      //creacion de detalles asociados
      if(nuevaCotizacion){
        const detallesConReferencia = listaDetalles.map(detalle => ({
          ...detalle,
          cotizacion: nuevaCotizacion.id,
        }))
        // Ejecutar todas las creaciones en paralelo 
        await Promise.all(
        detallesConReferencia.map(det => PostCotizacionLineaAPI(null, det))
        )
      console.log("Cotización y detalles guardados correctamente")
    } else {
      // no hay edicion solo creacion de nuevas
      console.log("no hay edicion de cotizacion")
    }
      
    }
  } catch (error) {
    console.error("error al guardar cotizacion: ", error)
  }
}


const handleSelectProducto = (producto: TProducto) => {
  try {
    console.log("producto seleccionado", producto)
    setListaDetalles((old) => {
      const yaExiste = old.some(item => item.producto === producto.id);
      if (yaExiste) return old;

      const detalle: TCotizacionDetalle = {
        producto: producto.id,
        cotizacion: 0, //al crear asignar a todas estas la cotizacion
        cantidad: 1,
        precio_unitario: producto.rprecio_actual?producto.rprecio_actual:0 ,
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <ChevronRight size={16} />
        <span onClick={()=>SetModoCotizacion('muchas')} 
        className="text-blue-600 hover:underline cursor-pointer">
          Lista cotizaciones /
          </span>
        <span> Cotización{' '}
        {crrCotizacion ? `${crrCotizacion.id} (${crrCotizacion.estado_cotizacion})` : '0 (Propuesta)'} </span>
        {edicionCotizacion === 'nuevo'&& <CustomButton type='submit'>Guardar Cotizacion</CustomButton>}
        {crrCotizacion && tipoEdicion === "vista" && crrCotizacion.estado_cotizacion==='propuesta' 
        && <div className="flex gap-8">
              <CustomButton
                variant='red'
                onClick={async () => {
                  const confirmacion = window.confirm('¿Estás seguro de que deseas rechazar esta cotización?')
                  if (confirmacion) {
                    const nueva = { ...crrCotizacion, estado_cotizacion: 'rechazada' as const}
                    await UpdateCotizacionAPI(null, crrCotizacion.id, nueva)
                  }
                }}
              >
              Rechazar Cotización
            </CustomButton>
            <CustomButton
              variant='green'
              onClick={async () => {
                const confirmacion = window.confirm('¿Deseas generar un pedido a partir de esta cotización?')
                if (confirmacion) {
                  const nueva = { ...crrCotizacion, estado_cotizacion: 'aceptada' as const}
                  const respuesta = await UpdateCotizacionAPI(null, crrCotizacion.id, nueva)
                  //el manejo de la alerta se hace dentro de UpdateCotizacionAPI
                  setCrrTab('pedido')
                }
              }}
            >
              Generar Pedido
            </CustomButton>
        </div>}
      </div>
      
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
              {/* Direccion de entrega */}
              <FormField
                control = {form.control}
                name = "direccion_entrega"
                render={({field}) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel> Direccion de Entrega</FormLabel>
                    <FormControl>
                      <Input type = "text" {...field} disabled={tipoDireccion==="tienda"}/>
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
                    <Input type = "text" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            </div>
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
          
        </div>
      
        {/* Tabla de detalles */}
        <div className="bg-white rounded-lg border">
          <CotizacionTable listaDetalles = {listaDetalles}/>
        </div>
      </div>
         
    </div>
  )
}