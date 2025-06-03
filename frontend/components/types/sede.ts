//agregar sedes
import {z} from "zod"

export const Sede = z.object({
    id: z.number(),
    nombre : z.string(),
    dgeneral: z.number(),
    activo: z.boolean()
})

export type TSede = z.infer<typeof Sede>;