
import { useState, useEffect, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { TCotizacion, TCotizacionDetalle } from '../types/cotizacion'
import { FormCotizacionValues, formCotizacionSchemaSend } from '../schemas/formCotizacionSchema'
import { GetCotizacionLineaListApi, PostCotizacionLineaAPI } from  '@/api/cotizacionDetalleApis';
import { PostCotizacionAPI, UpdateCotizacionAPI } from '@/api/cotizacionApis';
import { useOportunidadContext } from '@/context/oportunidadContext'
import { TProducto } from '@/app/inventario/producto/types/productoTypes';

interface UseCotizacionProps {
  form: UseFormReturn<FormCotizacionValues>
  tipoDireccion: 'tienda' | 'otro'
}

/**
 * Hook principal para manejar la lógica de cotización
 * Gestiona el estado, carga de datos y operaciones CRUD
 */
export const useCotizacion = ({ form, tipoDireccion }: UseCotizacionProps) => {
const [maximoPermisible, setMaximoPermisible] = useState('0.00');
const [listaDetalles, setListaDetalles] = useState<TCotizacionDetalle[]>([]);
const [isLoading, setIsLoading] = useState(false);

const { 
    crrCotizacion, 
    crrTab, 
    SetModoCotizacion, 
    edicionCotizacion, 
    crrOportunidad,
    setCrrTab 
} = useOportunidadContext();


    /**
 * Carga los datos de una cotización existente en el formulario
 */
//aca usa callback
const cargarCotizacion = useCallback((cotizacion: TCotizacion | null) => {
    if (!cotizacion) return
    
    console.log("la cotizacion a cargar es:", cotizacion)
    
    form.setValue('id', `${cotizacion.id}`)
    form.setValue('fecha', cotizacion.fecha)
    form.setValue('estado_cotizacion', cotizacion.estado_cotizacion)
    form.setValue('oportunidad', `${cotizacion.oportunidad}`)
    form.setValue('monto_sin_impuesto', cotizacion.monto_sin_impuesto.toFixed(2))
    form.setValue('monto_igv', cotizacion.monto_igv.toFixed(2))
    form.setValue('monto_total', cotizacion.monto_total.toFixed(2))
    form.setValue('descuento_adicional', cotizacion.descuento_adicional.toFixed(2))
    form.setValue('observaciones', cotizacion.observaciones || '')
    form.setValue('direccion_entrega', cotizacion.direccion_entrega || '')
    form.setValue('activo', cotizacion.activo ? 'true' : 'false')
}, [form])


/**
 * Efecto para cargar cotización cuando cambia el tab
 */
//aca usa crrCotizacion y cargarCotizacion
useEffect(() => {
    if (crrCotizacion && crrTab === 'cotizaciones') {
    console.log("cotizacion actual: ", crrCotizacion)
    cargarCotizacion(crrCotizacion)
    
    // Cargar detalles de la cotización
    GetCotizacionLineaListApi(null, crrCotizacion.id).then(
        data => setListaDetalles(data)
    )
    }
}, [crrTab, crrCotizacion, cargarCotizacion])


/**
 * Maneja la selección de un producto y lo agrega a la lista
 */
const handleSelectProducto = useCallback((producto: TProducto) => {
    try {
    console.log("producto seleccionado", producto)
    
    setListaDetalles((old) => {
        const yaExiste = old.some(item => item.producto === producto.id)
        if (yaExiste) return old

        const detalle: TCotizacionDetalle = {
        producto: producto.id,
        cotizacion: 0, // se asignará al crear la cotización
        cantidad: 1,
        precio_unitario: producto.rprecio_actual ? producto.rprecio_actual : 0,
        descuento: 0,
        subtotal: producto.rprecio_actual ? producto.rprecio_actual * 1 : 0,
        nrolinea: old.length + 1,
        activo: true,
        rnombre: '',
        rum: '',
        }
        
        console.log("ATENCION detalle:", detalle)
        return [...old, detalle]
    })
    } catch (error) {
    console.error('Error al seleccionar producto', error)
    }
}, [])

/**
   * Maneja el envío del formulario (crear/actualizar cotización)
   */
  const onSubmit = useCallback(async (rawdata: FormCotizacionValues) => {
    console.log('Datos del formulario:', rawdata)
    console.log('Datos del listado:', listaDetalles)
    
    setIsLoading(true)
    
    try {
      rawdata.oportunidad = `${crrOportunidad?.id}`
      if (tipoDireccion === 'tienda') rawdata.direccion_entrega = 'tienda'
      
      const data = formCotizacionSchemaSend.parse(rawdata)
      
      if (!crrCotizacion && edicionCotizacion === 'nuevo') {
        // Creación de nueva cotización
        const nuevaCotizacion = await PostCotizacionAPI(null, data)
        
        if (nuevaCotizacion) {
          // Crear detalles asociados a la nueva cotización
          const detallesConReferencia = listaDetalles.map(detalle => ({
            ...detalle,
            cotizacion: nuevaCotizacion.id,
          }))
          
          // Ejecutar todas las creaciones en paralelo
          await Promise.all(
            detallesConReferencia.map(det => PostCotizacionLineaAPI(null, det))
          ).finally(() => SetModoCotizacion('muchas'))

          console.log("Cotización y detalles guardados correctamente")
        }
      } else {
        // Aquí iría la lógica de actualización si es necesaria
        console.log("no hay edicion de cotizacion")
      }
    } catch (error) {
      console.error("error al guardar cotizacion: ", error)
    } finally {
      setIsLoading(false)
    }
  }, [
    listaDetalles, 
    crrOportunidad, 
    tipoDireccion, 
    crrCotizacion, 
    edicionCotizacion, 
    SetModoCotizacion
  ])


  /**
   * Maneja el rechazo de una cotización
   */
  const handleRechazarCotizacion = useCallback(async () => {
    if (!crrCotizacion) return
    
    const confirmacion = window.confirm('¿Estás seguro de que deseas rechazar esta cotización?')
    if (!confirmacion) return
    
    setIsLoading(true)
    try {
      const nueva = { ...crrCotizacion, estado_cotizacion: 'rechazada' as const }
      await UpdateCotizacionAPI(null, crrCotizacion.id, nueva)
    } catch (error) {
      console.error("Error al rechazar cotización:", error)
    } finally {
      setIsLoading(false)
    }
  }, [crrCotizacion])

  /**
   * Maneja la generación de pedido desde cotización
   */
  const handleGenerarPedido = useCallback(async () => {
    if (!crrCotizacion) return
    
    const confirmacion = window.confirm('¿Deseas generar un pedido a partir de esta cotización?')
    if (!confirmacion) return
    
    setIsLoading(true)
    try {
      const nueva = { ...crrCotizacion, estado_cotizacion: 'aceptada' as const }
      await UpdateCotizacionAPI(null, crrCotizacion.id, nueva)
      setCrrTab('pedido')
    } catch (error) {
      console.error("Error al generar pedido:", error)
    } finally {
      setIsLoading(false)
    }
  }, [crrCotizacion, setCrrTab])

  return {
    // Estado
    maximoPermisible,
    setMaximoPermisible,
    listaDetalles,
    setListaDetalles,
    isLoading,
    
    // Funciones
    handleSelectProducto,
    onSubmit,
    handleRechazarCotizacion,
    handleGenerarPedido,
    
    // Datos del contexto (para fácil acceso)
    crrCotizacion,
    edicionCotizacion,
    SetModoCotizacion
  }

}