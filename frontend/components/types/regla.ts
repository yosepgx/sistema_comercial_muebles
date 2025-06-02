import {z} from "zod"

const regla = z.object({
    producto: z.number(),
    grupo_id: z.number(),
    fecha_inicio: z.date(),
    fecha_fin: z.date(),
    monto_fijo: z.number(),
    porcentaje: z.number(),
    cantidad_pagada: z.number(),
    cantidad_libre: z.number(),
    cantidad_libre_maxima: z.number(),
})

export type TRegla = z.infer<typeof regla>