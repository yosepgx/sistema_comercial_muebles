import {z} from "zod"

const regla = z.object({
    id: z.number(),
    producto: z.number(),
    fecha_inicio: z.date(),
    fecha_fin: z.date(),
    monto_fijo: z.number(),
    porcentaje: z.number(),
    cantidad_pagada: z.number(),
    cantidad_libre: z.number(),
    cantidad_libre_maxima: z.number(),
    tipo_descuento : z.enum(['porcentaje','monto_fijo','cantidad']),
    activo : z.boolean(),
})

export type TRegla = z.infer<typeof regla>