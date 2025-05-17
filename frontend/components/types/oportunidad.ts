import {z} from "zod"

const oportunidad = z.object({
    contacto: z.number(),
    sede_id: z.number(),
    fecha_contacto: z.date(),
    vendedor_asignado: z.number(),
    estado_oportunidad: z.enum(["ganado","perdido","en negociacion"]),
    cliente_id: z.number(),
})

export type TOportunidad = z.infer<typeof oportunidad>