import {string, z} from "zod"

export const cotizacionDetalle = z.object({
    producto: z.number(),
    cotizacion: z.number(),
    cantidad: z.number(),
    precio_unitario: z.coerce.number(),
    descuento: z.coerce.number(),
    subtotal: z.coerce.number(),
    nrolinea: z.number(),
    activo: z.boolean(),
    rnombre: z.string(),
    rum: z.string(),
    rigv: z.string().nullable().optional(),
})

export const cotizacion = z.object({
    id: z.number(),
    fecha: z.string(),
    estado_cotizacion: z.enum(["propuesta","aceptada","rechazada"]),
    oportunidad: z.number(),
    monto_sin_impuesto: z.coerce.number(),
    monto_igv: z.coerce.number(),
    monto_total: z.coerce.number(),
    descuento_adicional: z.coerce.number(),
    observaciones: z.string().nullable(),
    direccion_entrega: z.string(),
    activo: z.boolean(),
    vendedor: z.string(),
})

export const cotizaciones = z.array(cotizacion);

export type TCotizacion = z.infer<typeof cotizacion>
export type TCotizacionDetalle = z.infer<typeof cotizacionDetalle>