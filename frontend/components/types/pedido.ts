import { tipoComprobanteChoices } from "@/constants/tipoComprobanteChoices"
import {string, z} from "zod"

const pedidoDetalle = z.object({
    producto: z.number(),
    pedido: z.number(),
    cantidad: z.coerce.number(),
    precio_unitario: z.coerce.number(),
    descuento: z.coerce.number(),
    subtotal: z.coerce.number(),
    nrolinea: z.number(),
    activo: z.boolean(),
    rnombre: z.string().optional(),
    rum: z.string().optional()
})

const pedido = z.object({
    id: z.number(),
    fecha: z.string(),
    fechaentrega: z.string().nullable(),
    fecha_pago: z.string().nullable(),
    serie: z.string().optional(), //read-only
    correlativo: z.string().optional(), //read-only
    tipo_comprobante: z.enum(["boleta",
    "factura", 
    tipoComprobanteChoices.TIPONCBOLETA, 
    tipoComprobanteChoices.TIPONCFACTURA,
    tipoComprobanteChoices.TIPONDBOLETA,
    tipoComprobanteChoices.TIPONDFACTURA,
  ]),
    direccion: z.string(),
    cotizacion: z.number(),
    moneda: z.enum(["PEN"]),
    estado_pedido: z.enum(["pendiente", "pagado", "despachado", "anulado"]),
    monto_sin_impuesto: z.number(),
    monto_igv: z.number(),
    monto_total: z.number(),
    descuento_adicional: z.number(),
    observaciones: z.string(),
    codigo_tipo_tributo: z.string(), //talvez number
    activo: z.boolean(),
    documento_referencia: z.number().nullable().optional(),
    tipo_nota:z.string().nullable().optional()
})
export const pedidoDetalleListSchema = z.array(pedidoDetalle)
export type TPedido = z.infer<typeof pedido>
export type TPedidoDetalle = z.infer<typeof pedidoDetalle>