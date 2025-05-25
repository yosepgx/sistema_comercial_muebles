import {z} from "zod"
import { cliente } from "./clienteType"
const oportunidad = z.object({
    id: z.number(),
    contacto: z.number(),
    sede_id: z.number(),
    fecha_contacto: z.date(),
    vendedor_asignado: z.number(),
    estado_oportunidad: z.enum(["ganado","perdido","en negociacion"]),
    rcliente: cliente,
    activo: z.boolean()
})

export type TOportunidad = z.infer<typeof oportunidad>