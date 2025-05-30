import {string, z} from "zod"

export const cliente = z.object({
    id: z.number(),
    nombre: z.string(),
    correo: z.string(),
    telefono: z.string(),
    tipo_interes: z.enum(["cliente","lead"]),
    fecha_conversion: z.string(),
    naturaleza: z.enum(["Natural","Empresa"]),
    documento: z.string(),
    tipo_documento: z.string(),
    activo: z.boolean(),
})

export type TCliente = z.infer<typeof cliente>