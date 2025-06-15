import { tipoComprobanteChoices } from "@/constants/tipoComprobanteChoices"
import {string, z} from "zod"
//la separacion es solo para controlar que las notas tienen cotizaciones null y los pedidos no
const notaDetalle = z.object({
    producto: z.number(),
    pedido: z.number(),
    cantidad: z.number(),
    precio_unitario: z.number(),
    descuento: z.number(),
    subtotal: z.number(),
    nrolinea: z.number(),
    activo: z.boolean(),
    rnombre: z.string(),
    rum: z.string()
})

const nota = z.object({
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
    cotizacion: z.number().nullable(),
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

export type TNota = z.infer<typeof nota>
export type TNotaDetalle = z.infer<typeof notaDetalle>