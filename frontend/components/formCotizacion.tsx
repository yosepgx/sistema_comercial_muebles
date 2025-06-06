'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TCotizacion, TCotizacionDetalle } from './types/cotizacion'
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
import { formCotizacionSchema, formCotizacionSchemaSend, FormCotizacionValues } from './schemas/formCotizacionSchema'
import { useCalculosCotizacion } from './hooks/useCalculosCotizacion'

export default function FormCotizacionDetalle() {
  const [loading, setLoading] = useState(true)
  const [maximoPermisible, setMaximoPermisible] = useState('0.00')
  const [tipoDireccion, setTipoDireccion] = useState<'tienda' | 'otro'>('tienda')
  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const {crrCotizacion, crrTab, SetModoCotizacion, tipoEdicion, crrOportunidad, setCrrTab,edicionCotizacion} = useOportunidadContext()
  const [listaDetalles, setListaDetalles] = useState<TCotizacionDetalle[]>([])
  const form = useForm<z.infer<typeof formCotizacionSchema>>({
    resolver: zodResolver(formCotizacionSchema),
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

  const descuento = form.watch('descuento_adicional', '0.00');

  const cargarCotizacion = (cotizacion: TCotizacion | null) => {
    if(!cotizacion) return;
    console.log("la cotizacion a cargar es:", cotizacion)
    form.setValue('id', `${cotizacion.id}`);
    form.setValue('fecha', cotizacion.fecha);
    form.setValue('estado_cotizacion', cotizacion.estado_cotizacion);
    form.setValue('oportunidad', `${cotizacion.oportunidad}`);
    form.setValue('monto_sin_impuesto', cotizacion.monto_sin_impuesto.toFixed(2));
    form.setValue('monto_igv', cotizacion.monto_igv.toFixed(2));
    form.setValue('monto_total', cotizacion.monto_total.toFixed(2));
    form.setValue('descuento_adicional', cotizacion.descuento_adicional.toFixed(2));
    form.setValue('observaciones', cotizacion.observaciones || '');
    form.setValue('direccion_entrega', cotizacion.direccion_entrega || '');
    form.setValue('activo', cotizacion.activo ? 'true' : 'false');
  };

  useEffect(()=>{
    if(crrCotizacion && crrTab === 'cotizaciones' &&edicionCotizacion!== 'nuevo'){
      console.log("cotizacion actual: ", crrCotizacion)
      setLoading(true);
      cargarCotizacion(crrCotizacion)
      GetCotizacionLineaListApi(null, crrCotizacion.id).then(
        data => setListaDetalles(data)
      ).catch(error => console.error('error al obtener lineas de cotizacion, error: ', error))
      .finally(()=>setLoading(false))
    }
  },[crrTab])

useCalculosCotizacion({listaDetalles, descuento, form, crrCotizacion})

const onSubmit = async (rawdata: FormCotizacionValues) => {
  console.log('Datos del formulario:', rawdata)
  
  try {
    rawdata.oportunidad = `${crrOportunidad?.id}`
    if(tipoDireccion === 'tienda')rawdata.direccion_entrega = 'tienda';
    const data = formCotizacionSchemaSend.parse(rawdata)
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
        ).finally(()=>SetModoCotizacion('muchas'))
        console.log('Datos del listado:', listaDetalles)
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
        activo: true,
        rnombre: producto.nombre,
        rum: producto.umedida_sunat,
      };
      console.log("ATENCION detalle:",detalle)
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
        {crrCotizacion && edicionCotizacion === "edicion" && crrCotizacion.estado_cotizacion==='propuesta' 
        && <div className="flex gap-8">
              <CustomButton
                type='button'
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
              type='button'
              variant='green'
              onClick={async () => {
                const confirmacion = window.confirm('¿Deseas generar un pedido a partir de esta cotización?')
                if (confirmacion) {
                  const nueva = { ...crrCotizacion, estado_cotizacion: 'aceptada' as const}
                  const respuesta = await UpdateCotizacionAPI(null, crrCotizacion.id, nueva)
                  //el manejo de la alerta se hace dentro de UpdateCotizacionAPI
                  if(respuesta)setCrrTab('pedido')
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
                        <Input type = "number" step={"0.1"}{...field} className='flex'/>
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
              <FormField
                  control = {form.control}
                  name = "monto_total"
                  render={({field}) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel> Monto Total</FormLabel>
                      <FormControl>
                        <Input type = "number" {...field} disabled={true}/>
                      </FormControl>
                      <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                  )}
                />  
              
              </div>

              <div className="space-y-2">
              <Label>
                Monto Gravado
              </Label>
              <Input
                id="montoGravado"
                value={form.watch('monto_sin_impuesto')}
                disabled = {true}
              />
              </div>

              <div className="space-y-2">
              <Label>
                IGV
              </Label>
              <Input
                id="igv"
                value={form.watch('monto_igv')}
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
          type='button'
          onClick={()=>setIsSearchPopupOpen(true)}>
            Agregar Línea
          </CustomButton>
          
        </div>
      
        {/* Tabla de detalles */}
        {(loading && edicionCotizacion !== 'nuevo')? (<div>Cargando ...</div>) : 
        (<div className="bg-white rounded-lg border">
          <CotizacionTable
            detalles={listaDetalles}
            setDetalles={setListaDetalles}
          />
        </div>)
}
      </div>
         
    </div>
  )
}