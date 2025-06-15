import { tipoComprobanteChoices } from '@/constants/tipoComprobanteChoices'
import {z} from 'zod'

export const formPedidoSchema = z. object({
  id: z.string(),     //manejado por back
  fecha: z.string(), //manejado por back
  fechaentrega: z.string(),
  fecha_pago: z.string(),
  serie: z.string().optional(), //debe de ser manejado por back
  correlativo: z.string().optional(), //debe de ser manejado por back
  tipo_comprobante: z.enum(["boleta",
    "factura", 
    tipoComprobanteChoices.TIPONCBOLETA, 
    tipoComprobanteChoices.TIPONCFACTURA,
    tipoComprobanteChoices.TIPONDBOLETA,
    tipoComprobanteChoices.TIPONDFACTURA,
  ]),
  direccion: z.string(),
  cotizacion: z.string(),
  moneda: z.enum(['PEN']),
  estado_pedido: z.enum(["pendiente","pagado","despachado", "anulado"]), 
  monto_sin_impuesto: z.string(), //suma ingresada al final
  monto_igv: z.string(),
  monto_total: z.string(),
  descuento_adicional: z.string(),
  observaciones: z.string().nullable().transform(v => v ?? ""),
  codigo_tipo_tributo: z.string(),
  activo: z.string(),
  documento_referencia: z.number().nullable().optional(),
  tipo_nota: z.string().nullable().optional()
})

export type FormPedidoValues = z.infer<typeof formPedidoSchema>

export const formPedidoSchemaSend = formPedidoSchema.transform ( data => ({
  ...data,
  id: parseInt(data.id,10),
  cotizacion: parseInt(data.cotizacion, 10), //undefined para ''
  fecha_pago: data.fecha_pago === ''?null : data.fecha_pago,
  fechaentrega: data.fecha_pago === ''?null : data.fechaentrega,
  monto_sin_impuesto: parseFloat(data.monto_sin_impuesto),
  monto_igv: parseFloat(data.monto_igv),
  monto_total: parseFloat(data.monto_total),
  descuento_adicional: parseFloat(data.descuento_adicional),
  documento_relacionado: null,
  tipo_nota: null,
  activo: data.activo ==='true',
}))