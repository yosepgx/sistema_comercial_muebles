import {z} from 'zod' 

//TODO: falta agregar nro de linea a cada detalle

export const formCotizacionSchema = z. object({
  id: z.string(),     //manejado por back
  fecha: z.string(), //manejado por back 
  estado_cotizacion: z.enum(["propuesta","aceptada","rechazada"]), // si usa el boton de aceptar o rechazar 
  //vendedor_asignado: z.number(),
  oportunidad: z.string(),
  monto_sin_impuesto: z.string(), //suma ingresada al final
  monto_igv: z.string(),
  monto_total: z.string(),
  descuento_adicional: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "El descuento debe ser un número mayor a 0"
  }),
  observaciones: z.string(),
  direccion_entrega: z.string().min(1,"Es necesaria direccion de entrega"), //deberia de funcionar ya que se asigna la direccion despues
  activo: z.string(),

})

export const formCotizacionSchemaSend = formCotizacionSchema.transform ( data => ({
  ...data,
  id: parseInt(data.id,10),
  oportunidad: parseInt(data.oportunidad,10),
  monto_sin_impuesto: parseFloat(data.monto_sin_impuesto),
  monto_igv: parseFloat(data.monto_igv),
  monto_total: parseFloat(data.monto_total),
  descuento_adicional: parseFloat(data.descuento_adicional),
  activo: data.activo==='true',
  //vendedor_asignado = 1, //TODO: funcionalidades de asignar vendedor
  
}))

export type FormCotizacionValues = z.infer<typeof formCotizacionSchema>