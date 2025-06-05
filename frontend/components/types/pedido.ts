import {string, z} from "zod"

const pedidoDetalle = z.object({
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

const pedido = z.object({
    id: z.number(),
    fecha: z.string(),
    fechaentrega: z.string().nullable(),
    fecha_pago: z.string().nullable(),
    serie: z.string().optional(), //read-only
    correlativo: z.string().optional(), //read-only
    tipo_comprobante: z.enum(["boleta","factura"]),
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
})

export type TPedido = z.infer<typeof pedido>
export type TPedidoDetalle = z.infer<typeof pedidoDetalle>