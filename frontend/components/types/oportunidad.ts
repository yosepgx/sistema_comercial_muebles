import {z} from "zod"
import { cliente } from "./clienteType"
const oportunidad = z.object({
    id: z.number(),
    cliente: z.number().nullable(),
    sede: z.number(),
    fecha_contacto: z.string(),
    estado_oportunidad: z.enum(["ganado","perdido","negociacion"]),
    rcliente: z.string().optional().nullable(),
    activo: z.boolean(),
    rvalor_neto: z.string().optional().nullable()
})

export type TOportunidad = z.infer<typeof oportunidad>