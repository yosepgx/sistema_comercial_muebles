import {string, z} from "zod"

const cotizacionDetalle = z.object({
    producto_id: z.number(),
    cotizacion_id: z.number(),
    cantidad: z.number(),
    precio: z.number(),
    descuento: z.number(),
    subtotal: z.number(),
    nrolinea: z.number(),
    activo: z.boolean(),
})

const cotizacion = z.object({
    id: z.number(),
    fecha: z.date(),
    estado_cotizacion: z.enum(["propuesta","aceptada","rechazada"]),
    //cliente_id: z.number(),
    //sede_id: z.number(),
    //vendedor_asignado: z.number(),
    
    monto_sin_impuesto: z.number(),
    monto_igv: z.number(),
    monto_total: z.number(),
    descuento_adicional: z.number(),
    observaciones: z.string(),
    direccion_entrega: z.string(),
    activo: z.boolean(),
})

export type TCotizacion = z.infer<typeof cotizacion>
export type TCotizacionDetalle = z.infer<typeof cotizacionDetalle>