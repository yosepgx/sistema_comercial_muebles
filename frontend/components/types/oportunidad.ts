import {z} from "zod"
import { cliente } from "./clienteType"
const oportunidad = z.object({
    id: z.number(),
    cliente: z.number(),
    sede_id: z.number(),
    fecha_contacto: z.date(),
    estado_oportunidad: z.enum(["ganado","perdido","en negociacion"]),
    rcliente: cliente,
    activo: z.boolean()
})

export type TOportunidad = z.infer<typeof oportunidad>