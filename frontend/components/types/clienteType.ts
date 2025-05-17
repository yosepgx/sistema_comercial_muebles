import {string, z} from "zod"

const cliente = z.object({
    id: z.number(),
    nombre: z.string(),
    correo: z.string(),
    telefono: z.string(),
    tipoInteres: z.enum(["cliente","lead"]),
    fechaConversion: z.date(),
    naturaleza: z.enum(["Natural","Empresa"]),
    cod_dni: z.string(),
    cod_ruc: z.string(),
    activo: z.boolean(),
})

export type TCliente = z.infer<typeof cliente>