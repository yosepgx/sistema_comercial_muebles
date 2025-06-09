import {z} from "zod"

export const regla = z.object({
    id: z.number(),
    producto: z.number(),
    fecha_inicio: z.string(),
    fecha_fin: z.string(),
    monto_fijo: z.number(),
    porcentaje: z.number(),
    cantidad_pagada: z.number(),
    cantidad_libre: z.number(),
    cantidad_libre_maxima: z.number(),
    tipo_descuento : z.enum(['porcentaje','monto_fijo','cantidad']),
    activo : z.boolean(),
})

export type TRegla = z.infer<typeof regla>