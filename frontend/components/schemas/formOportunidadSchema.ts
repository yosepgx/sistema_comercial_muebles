import {z} from 'zod'
import {format} from 'date-fns'
import { cliente } from '../types/clienteType'

export const formOportunidadSchema = z.object({
  id: z.string(),
  cliente: z.string().nullable(), 
  sede: z.string(),
  fecha_contacto: z.string(), //manejado por back
  estado_oportunidad: z.enum(["ganado","perdido","negociacion"]),
  activo: z.string(),
  rcliente: z.string().optional().nullable(),
  rvalorneto: z.string().optional().nullable(),
})

export const formOportunidadSchemaSend = formOportunidadSchema.transform(data => ({
  ...data,
  id: parseInt(data.id,10),
  cliente: data.cliente?parseInt(data.cliente,10):null,
  sede: parseInt(data.sede,10),
  fecha_contacto: format(data.fecha_contacto, 'yyyy-MM-dd'),
  activo: data.activo === 'true',
  rvalorneto: null,
  })
)
export type FormOportunidadValues = z.infer<typeof formOportunidadSchema>