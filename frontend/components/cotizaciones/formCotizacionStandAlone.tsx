'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TCotizacionDetalle } from '../types/cotizacion' 
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import CustomButton from '../customButtom' 
import { useOportunidadContext } from '@/context/oportunidadContext'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { GetCotizacionLineaListApi, PostCotizacionLineaAPI } from '@/api/cotizacionDetalleApis'
import { TProducto } from '@/components/types/productoTypes'
import ProductSearchPopup from '../popsearchproducto'
import { CotizacionTable } from '../tableCotizacion'
import { GetCotizacionDetailApi, PostCotizacionAPI, UpdateCotizacionAPI } from '@/api/cotizacionApis'
import { TCotizacion } from '../types/cotizacion'
import { useParams, useRouter } from 'next/navigation'
import { formCotizacionSchema, formCotizacionSchemaSend, FormCotizacionValues } from '../schemas/formCotizacionSchema'
import { useCalculosCotizacion } from '../hooks/useCalculosCotizacion'
import { GetDatoGeneralDetailApi } from '@/api/datogeneralApis'
import { cargarCotizacion } from './cargarCotizacion'


type Props = {
  edicionCotizacion: 'nuevo' | 'edicion'
}


export default function FormCotizacionStandAlone({edicionCotizacion}: Props) {
  const router = useRouter()
  const [porcentajePermisible, setPorcentajePermisible] = useState(0.05)
  const [maximoPermisible, setMaximoPermisible] = useState(0.00)
  const {id} = useParams()
  const [tipoDireccion, setTipoDireccion] = useState<'tienda' | 'otro'>('tienda')
  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [crrCotizacion, setCrrCotizacion] = useState<TCotizacion | null>(null)
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

const fetchCotizacion = async () => {
    const cotizacion = await GetCotizacionDetailApi(null, parseInt(id as string, 10))
    if(cotizacion){
        const listado = await GetCotizacionLineaListApi(null, parseInt(id as string, 10))
        const data = await GetDatoGeneralDetailApi(null, 1)
        const margen = data?.margen_general??5.00
        const margenTasa = margen/100
        setPorcentajePermisible(margenTasa)
        setMaximoPermisible((margenTasa*cotizacion.monto_total))
        setCrrCotizacion(cotizacion)
        setListaDetalles(listado)
    }
    return cotizacion;
}


useEffect(()=>{
    if(edicionCotizacion ==='edicion' && id){
        const cargar = async () => {
            const data = await fetchCotizacion();
            if(data?.direccion_entrega !== 'tienda'){
              setTipoDireccion('otro')
            }
            cargarCotizacion(data, form);              
        };
        cargar();
    }
  },[edicionCotizacion, id])

useCalculosCotizacion({listaDetalles, descuento, form, crrCotizacion, porcentajePermisible, setMaximoPermisible})

const onSubmit = async (rawdata: FormCotizacionValues) => {
  console.log('Datos del formulario:', rawdata)
  console.log('Datos del listado:', listaDetalles)
  try {
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
        activo: true,
        rnombre: '',
        rum: '',
        rigv: (producto.igv ?? 0.18).toFixed(2)
      };
      console.log("ATENCION detalle:",detalle)
      return [...old, detalle];
    });

    setIsSearchPopupOpen(false);
  } catch (error) {
    console.error('Error al seleccionar producto', error);
  }
};

if(!crrCotizacion)return (<div>Cargando...</div>)

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
        <span onClick={()=>router.push('/cotizaciones')} 
        className="text-blue-600 hover:underline cursor-pointer">
          Lista cotizaciones /
          </span>
        <span> Cotización{' '}
        {crrCotizacion ? `${crrCotizacion.id} (${crrCotizacion.estado_cotizacion})` : '0 (Propuesta)'} </span>
        {edicionCotizacion === 'nuevo'&& <CustomButton type='submit'>Guardar Cotizacion</CustomButton>}
        {crrCotizacion && edicionCotizacion === "nuevo" && crrCotizacion.estado_cotizacion==='propuesta' 
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
                disabled = {edicionCotizacion === 'edicion'}
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
                    <FormLabel> Dirección de Entrega</FormLabel>
                    <FormControl>
                      <Input type = "text" {...field} disabled={tipoDireccion==="tienda" || edicionCotizacion === 'edicion'}/>
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
                        <Input type = "number" step={"0.1"}{...field} className='flex' disabled = {edicionCotizacion === 'edicion'}/>
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
                  type = "number"
                  value={maximoPermisible}
                  disabled = {true}
                />
              </div>
            </div>
            {/* Observación/Razón de rechazo */}
            <div>
            <FormField
              control = {form.control}
              name = "vendedor"
              render={({field}) => (
                <FormItem className='flex flex-col'>
                  <FormLabel> Vendedor</FormLabel>
                  <FormControl>
                    <Input type = "text" {...field} disabled={edicionCotizacion==='edicion'}/>
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
                  <FormLabel> Observación/Razón de rechazo</FormLabel>
                  <FormControl>
                    <Input type = "text" {...field} />
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
                value={form.watch('monto_total')}
                disabled = {true}
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
        {edicionCotizacion === 'nuevo' &&  <div className="flex justify-between items-center mb-4">
          <CustomButton variant='primary'
          type='button'
          
          onClick={()=>setIsSearchPopupOpen(true)}>
            Agregar Línea
          </CustomButton>
          
        </div>}
      
        {/* Tabla de detalles */}
        <div className="bg-white rounded-lg border">
          <CotizacionTable
            detalles={listaDetalles}
            setDetalles={setListaDetalles}
            isDisabled={edicionCotizacion==='edicion'}
          />
        </div>
      </div>
         
    </div>
  )
}