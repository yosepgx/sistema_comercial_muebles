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
import { TProducto } from '@/components/types/productoTypes'
import ProductSearchPopup from './popsearchproducto'
import { CotizacionTable } from './tableCotizacion'
import { PostCotizacionAPI, UpdateCotizacionAPI } from '@/api/cotizacionApis'
import { formCotizacionSchema, formCotizacionSchemaSend, FormCotizacionValues } from './schemas/formCotizacionSchema'
import { useCalculosCotizacion } from './hooks/useCalculosCotizacion'
import { GetDatoGeneralDetailApi } from '@/api/datogeneralApis'
import { useDescuentosAutomaticos } from './descuentos/useDescuentosAutomaticos'
import { NewCotizacionTable } from './newTableCotizacion'
import { cargarCotizacion } from './cotizaciones/cargarCotizacion'

export default function FormCotizacionDetalle() {
  const [loading, setLoading] = useState(true)
  const [porcentajePermisible , setPorcentajePermisible] = useState(0.05);
  const [maximoPermisible, setMaximoPermisible] = useState(0.00)
  const [tipoDireccion, setTipoDireccion] = useState<'tienda' | 'otro'>('tienda')
  const [isDescuentoOpen, setIsDescuentoOpen] = useState(true)
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const {crrCotizacion, crrTab, SetModoCotizacion, tipoEdicion, crrOportunidad, setCrrTab,edicionCotizacion} = useOportunidadContext()
  const { aplicarDescuentosADetalle, recalcularDescuentosLista, loading: descuentosLoading } = useDescuentosAutomaticos()

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
      vendedor: '',
    }
  })

  const descuento = form.watch('descuento_adicional', '0.00');


  useEffect(()=>{
    if(crrCotizacion && crrTab === 'cotizaciones' &&edicionCotizacion!== 'nuevo'){
      console.log("cotizacion actual: ", crrCotizacion)
      setLoading(true);
      if(crrCotizacion?.direccion_entrega !== 'tienda'){
        setTipoDireccion('otro')
      }
      cargarCotizacion(crrCotizacion, form)
      GetCotizacionLineaListApi(null, crrCotizacion.id).then(
        data => setListaDetalles(data)
      ).catch(error => console.error('error al obtener lineas de cotizacion, error: ', error))
      .finally(()=>{
        GetDatoGeneralDetailApi(null,1).then(data => {
          const margen = data?.margen_general??5.00
          const margenTasa = margen/100
          const total = crrCotizacion.monto_total + crrCotizacion.descuento_adicional
          const maximo = Math.round(margenTasa * total * 100) / 100
          setPorcentajePermisible(margenTasa)
          setMaximoPermisible(maximo)
          //setMaximoPermisible(Math.round(margenTasa*(crrCotizacion.monto_total + crrCotizacion.descuento_adicional)))
        })
        .catch(error => console.error('error no se encontro configuracion general', error))
        .finally(()=>setLoading(false)) 
      })
    }
    else if(edicionCotizacion ==='nuevo'){
      GetDatoGeneralDetailApi(null,1).then(data => {
          const margen = data?.margen_general??5.00
          const margenTasa = margen/100
          setPorcentajePermisible(margenTasa)
          setMaximoPermisible(0.00)
        })
        .catch(error => console.error('error no se encontro configuracion general', error))
        .finally(()=>setLoading(false))
    }
  },[crrTab])

useCalculosCotizacion({listaDetalles, descuento, form, crrCotizacion, porcentajePermisible, setMaximoPermisible})

const onSubmit = async (rawdata: FormCotizacionValues) => {
  console.log('Datos del formulario:', rawdata)
  
  try {
    rawdata.oportunidad = `${crrOportunidad?.id}`
    if(tipoDireccion === 'tienda')rawdata.direccion_entrega = 'tienda';
    const data = formCotizacionSchemaSend.parse(rawdata)

    const descuento = data.descuento_adicional;
    if (descuento > maximoPermisible) {
      form.setError("descuento_adicional", {
        type: "manual",
        message: `El descuento no puede ser mayor a S/. ${maximoPermisible.toFixed(2)}`,
      });
      return;
    }

    if (listaDetalles.length === 0) {
      alert("Debe agregar al menos un producto a la cotización");
      return;
    }

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
    const yaExiste = listaDetalles.some(item => item.producto === producto.id);
    if (yaExiste) return;
    //si no esta creas la linea
    const detalle: TCotizacionDetalle = {
      producto: producto.id,
      cotizacion: 0,
      cantidad: 1,
      precio_unitario: producto.rprecio_actual ?? 0,
      descuento: 0,
      subtotal: producto.rprecio_actual ?? 0,
      nrolinea: listaDetalles.length + 1,
      activo: true,
      rnombre: producto.nombre,
      rum: producto.umedida_sunat,
      rigv: Number(producto.igv ?? 0.18).toFixed(2)
    };
    //mandas al back para calcular
    aplicarDescuentosADetalle(detalle)
      .then((detalleConDescuento) => {
        //asignas a la lista actual
        setListaDetalles(prev => [...prev, detalleConDescuento]);
      })
      .catch(error => {
        console.error('Error aplicando descuentos', error);
        setListaDetalles(prev => [...prev, detalle]);
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
                    const obs = form.getValues('observaciones') ?? ''
                    const nueva = { ...crrCotizacion, estado_cotizacion: 'rechazada' as const, observaciones: obs}
                    await UpdateCotizacionAPI(null, crrCotizacion.id, nueva)
                    SetModoCotizacion('muchas')
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
          <div className="grid grid-cols-2 gap-4">
            {/* Descuento auxiliar */}
            <div>
              <div className='flex flex-row gap-8' > 
              <RadioGroup
                value={tipoDireccion}
                onValueChange={(value: 'tienda' | 'otro') => setTipoDireccion(value)}
                className="flex flex-col "
                disabled={edicionCotizacion === 'edicion'}
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
                  <FormItem className='flex flex-col w-full'>
                    <FormLabel> Dirección de Entrega</FormLabel>
                    <FormControl>
                      <Input type = "text" {...field}  disabled={tipoDireccion==="tienda" || edicionCotizacion === 'edicion'}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                  </FormItem>
                )}
              />
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
                    <Input type = "text" {...field}/>
                  </FormControl>
                  <FormMessage className="min-h-[24px]"/>
                </FormItem>
              )}
            />
            </div>
            </div>
            
            <div>
              <div className='flex flex-row space-x-4'>
                <div >
                <FormField
                  control = {form.control}
                  name = "descuento_adicional"
                  render={({field}) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel> Monto de Descuento Auxiliar</FormLabel>
                      <FormControl>
                        <Input type = "number" step={"0.1"}{...field} disabled={edicionCotizacion === 'edicion'}/>
                      </FormControl>
                      <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                  )}
                />
                </div>
                {/* Máximo permisible */}

                <div className="flex flex-col space-y-2">
                <Label>
                  Máximo permisible
                </Label>
                <Input
                  id="maximoPermisible"
                  type='number'
                  value={maximoPermisible}
                  disabled = {true}
                />
              </div>
            </div>
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
        {edicionCotizacion === 'nuevo' && <div className="flex justify-between items-center mb-4">
          <CustomButton variant='primary'
          type='button'
          onClick={()=>setIsSearchPopupOpen(true)}>
            Agregar Línea
          </CustomButton>
          
        </div>}
      
        {/* Tabla de detalles */}
        {(loading && edicionCotizacion !== 'nuevo')? (<div>Cargando ...</div>) : 
        (<div className="bg-white rounded-lg border">
          <NewCotizacionTable
            detalles={listaDetalles}
            setDetalles={setListaDetalles}
            isDisabled = { edicionCotizacion === 'edicion'}
          />
        </div>)
        }
      </div>
         
    </div>
  )
}