import {z} from "zod"
import { cliente } from "./clienteType"
const oportunidad = z.object({
    id: z.number(),
    cliente: z.number().nullable(),
    sede_id: z.number(),
    fecha_contacto: z.string(),
    estado_oportunidad: z.enum(["ganado","perdido","negociacion"]),
    rcliente: cliente.optional().nullable(),
    activo: z.boolean(),
    rvalorneto: z.number().optional().nullable()
})

export type TOportunidad = z.infer<typeof oportunidad>