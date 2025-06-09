import {z} from 'zod'
import {format} from 'date-fns'

export const formClienteSchema = z.object({
  id: z.string().min(1, 'no se encontro id'),
  nombre: z.string().min(1, 'Se necesita indicar un nombre'),
  correo: z.string().min(1, 'Se necesita llenar este campo o indicar ninguno'),
  telefono: z.string().min(1, 'Se necesita llenar este campo o indicar ninguno'),
  naturaleza: z.enum(["Natural","Empresa"]),
  tipo_interes: z.enum(["cliente","lead"]), //manejado por back
  fecha_conversion: z.string().nullable(), //se maneja en back
  documento: z.string(),
  tipo_documento: z.string(),
  activo: z.string(), //manejado por back
}).superRefine((data, ctx) => {
    if (data.tipo_documento === 'DNI' && data.documento.length !== 8) {
      ctx.addIssue({
        path: ['documento'],
        code: z.ZodIssueCode.custom,
        message: 'El DNI debe tener exactamente 8 dígitos',
      })
    }

    if (data.tipo_documento === 'RUC' && data.documento.length !== 11) {
      ctx.addIssue({
        path: ['documento'],
        code: z.ZodIssueCode.custom,
        message: 'El RUC debe tener exactamente 11 dígitos',
      })
    }

    if (!/^\d+$/.test(data.documento)) {
      ctx.addIssue({
        path: ['documento'],
        code: z.ZodIssueCode.custom,
        message: 'El documento debe contener solo números',
      })
    }
  })


export type FormClienteValues = z.infer<typeof formClienteSchema>


export const formClienteSchemaSend = formClienteSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    fecha_conversion: data.fecha_conversion?format(new Date(data.fecha_conversion), 'yyyy-MM-dd'): null,
    activo: data.activo === "true",
  })
)