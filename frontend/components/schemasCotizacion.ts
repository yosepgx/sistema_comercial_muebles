import {z} from 'zod'
const formSchema = z.object({
  id: z.string(),
  fecha: z.string(), //creacion manejada por back
  estado_cotizacion: z.enum(["propuesta","aceptada","rechazada"]),
  //cliente_id: z.number(),
  //sede_id: z.number(),
  //vendedor_asignado: z.number(),
  validez: z.string(),
  monto_sin_impuesto: z.string(),
  monto_igv: z.string(),
  monto_total: z.string(),
  descuento_adicional: z.string(),
  observaciones: z.string(),
  direccion_entrega: z.string(),
  activo: z.string(),
})

const formSchemaSend = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    validez: parseInt(data.validez, 10),
    monto_sin_impuesto: parseInt(data.monto_sin_impuesto),
    monto_igv: parseInt(data.monto_igv),
    monto_total: parseInt(data.monto_total),
    descuento_adicional: parseInt(data.descuento_adicional),
    activo: data.activo === "true",
  })
)