import {z} from 'zod'

export const pedidoSchema = z. object({
  id: z.string(),     //manejado por back
  fecha: z.string(), //manejado por back
  fechaentrega: z.string(),
  fecha_pago: z.string(),
  serie: z.string().optional(), //debe de ser manejado por back
  correlativo: z.string().optional(), //debe de ser manejado por back
  tipo_comprobante: z.enum(["boleta","factura"]),
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
})

export type FormPedidoValues = z.infer<typeof pedidoSchema>

export const pedidoSchemaSend = pedidoSchema.transform ( data => ({
  ...data,
  id: parseInt(data.id,10),
  tipo_comprobante: parseInt(data.tipo_comprobante,10),
  cotizacion: parseInt(data.id, 10),
  monto_sin_impuesto: parseFloat(data.monto_sin_impuesto),
  monto_igv: parseFloat(data.monto_igv),
  monto_total: parseFloat(data.monto_total),
  descuento_adicional: parseFloat(data.descuento_adicional),
}))