import {z} from "zod"

export const formReglaSchema = z.object({
    id: z.string(),
    producto: z.string(),
    fecha_inicio: z.string()
    .min(1, "Este campo es necesario")
    .refine(val => !isNaN(Date.parse(val)), {
        message: 'Fecha de inicio invalida'
    }),
    fecha_fin: z.string()
    .min(1, "Este campo es necesario")
    .refine(val => !isNaN(Date.parse(val)), {
        message: 'Fecha de fin invalida'
    }),
    monto_fijo: z.string().min(1, "Este campo es necesario"),
    porcentaje: z.string().min(1, "Este campo es necesario").refine(
    val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val)< 100, {
        message: "El margen debe ser un número positivo menor a 100"
    }),
    cantidad_pagada: z.string().min(1, "Este campo es necesario")
        .refine(val => /^[0-9]+$/.test(val), {
        message: "Debe ser un número entero positivo sin decimales",
        }),
    cantidad_libre: z.string().min(1, "Este campo es necesario")
    .refine(val => /^[0-9]+$/.test(val), {
        message: "Debe ser un número entero positivo sin decimales",
        }),
    cantidad_libre_maxima: z.string().min(1, "Este campo es necesario")
        .refine(val => /^[0-9]+$/.test(val), {
        message: "Debe ser un número entero positivo sin decimales",
        }),
    tipo_descuento : z.enum(['porcentaje','monto_fijo','cantidad']),
    activo : z.string(),
}).refine((data) => data.fecha_fin > data.fecha_inicio, {
    message: "La fecha de fin no puede ser menor a la fecha de fin",
    path: ["fecha_fin"],
  });

export const formReglaSchemaSend = formReglaSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    producto: parseInt(data.producto, 10),
    fecha_inicio: new Date(data.fecha_inicio).toISOString(),
    fecha_fin: new Date(data.fecha_fin).toISOString(),
    monto_fijo: parseFloat(data.monto_fijo),
    porcentaje: parseFloat(data.porcentaje),
    cantidad_pagada: parseInt(data.cantidad_pagada, 10),
    cantidad_libre: parseInt(data.cantidad_libre, 10),
    cantidad_libre_maxima: parseInt(data.cantidad_libre_maxima, 10),
    activo : data.activo === 'true',
    })
)

export type FormReglaValues = z.infer<typeof formReglaSchema>