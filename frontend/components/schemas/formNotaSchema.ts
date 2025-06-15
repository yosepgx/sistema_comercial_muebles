import { tipoComprobanteChoices } from '@/constants/tipoComprobanteChoices'
import {z} from 'zod'

export const formNotaSchema = z. object({
  id: z.string(),     //manejado por back
  fecha: z.string(), //manejado por back
  fechaentrega: z.string(),//obviado
  fecha_pago: z.string(),//obviado
  serie: z.string().optional(), //debe de ser manejado por back
  correlativo: z.string().optional(), //debe de ser manejado por back
  tipo_comprobante: z.enum(["boleta",
    "factura", 
    tipoComprobanteChoices.TIPONCBOLETA, 
    tipoComprobanteChoices.TIPONCFACTURA,
    tipoComprobanteChoices.TIPONDBOLETA,
    tipoComprobanteChoices.TIPONDFACTURA,
  ]),
  direccion: z.string(),//obviado
  cotizacion: z.string(),//null
  moneda: z.enum(['PEN']),
  estado_pedido: z.enum(["pendiente","pagado","despachado", "anulado"]), 
  monto_sin_impuesto: z.string(), 
  monto_igv: z.string(),
  monto_total: z.string(),
  descuento_adicional: z.string(),//no hay
  observaciones: z.string().min(1,"Es necesario indicar la razon"), //es el campo razon y es obligatorio
  codigo_tipo_tributo: z.string(),//1000
  activo: z.string(),//true
  documento_referencia: z.number().nullable(),
  tipo_nota: z.string()
})

export type FormNotaValues = z.infer<typeof formNotaSchema>

export const formNotaSchemaSend = formNotaSchema.transform ( data => ({
  ...data,
  id: parseInt(data.id,10),
  cotizacion: null, 
  fecha_pago: data.fecha_pago === ''?null : data.fecha_pago,
  fechaentrega: data.fecha_pago === ''?null : data.fechaentrega,
  monto_sin_impuesto: parseFloat(data.monto_sin_impuesto),
  monto_igv: parseFloat(data.monto_igv),
  monto_total: parseFloat(data.monto_total),
  descuento_adicional: parseFloat(data.descuento_adicional),
  documento_relacionado: data.documento_referencia? data.documento_referencia: null,
  tipo_nota: data.tipo_nota? data.tipo_nota: null,
  activo: data.activo ==='true',
}))