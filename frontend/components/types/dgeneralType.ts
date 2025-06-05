import {string, z} from "zod";

export const datogeneral = z.object({
    id: z.number(),
    codigo_RUC: z.string(),
    razon_social: z.string(),
    nombre_comercial: z.string(),
    direccion_fiscal: z.string(),
    margen_general: z.number(),
    activo: z.boolean(),

})
export type TDGeneral = z.infer<typeof datogeneral>;

