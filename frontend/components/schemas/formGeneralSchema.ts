import {z} from 'zod'

export const formGeneralSchema = z.object({
    id: z.string(),
    codigo_RUC: z.string().min(11,"Es necesario llenar este campo").regex(/^\d+$/, "El RUC solo debe contener números"),
    razon_social: z.string().min(1,"Es necesario llenar este campo"),
    nombre_comercial: z.string().min(1,"Es necesario llenar este campo"),
    direccion_fiscal: z.string().min(1,"Es necesario llenar este campo"),
    margen_general: z.string().refine(
    val => !isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val)< 100, {
        message: "El margen debe ser un número entre 0 y 100"
    }),
    activo: z.string(),
})

export type FormGeneralValues = z.infer<typeof formGeneralSchema>


export const formGeneralSchemaSend = formGeneralSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    margen_general: parseFloat(data.margen_general),
    activo: data.activo === "true",
  })
)