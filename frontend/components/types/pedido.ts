import {string, z} from "zod"

const pedidoDetalle = z.object({
    producto_id: z.number(),
    pedido_id: z.number(),
    cantidad: z.number(),
    precio: z.number(),
    descuento: z.number(),
    subtotal: z.number(),
    nrolinea: z.number(),
    activo: z.boolean(),
})

const pedido = z.object({
    id: z.number(),
    fecha: z.date(),
    fechaentrega: z.date(),
    fecha_pago: z.date(),
    serie: z.string(),
    correlativo: z.string(),
    tipo_comprobante: z.enum(["boleta","factura"]),
    direccion_entrega: z.string(),
    cotizacion_id: z.number(),
    moneda: z.enum(["PEN"]),
    estado_pedido: z.enum(["por validar", "pagado", "despachado", "anulado"]),
    monto_sin_impuesto: z.number(),
    monto_igv: z.number(),
    monto_total: z.number(),
    descuento_adicional: z.number(),
    observaciones: z.string(),
    codigo_tipo_tributo: z.string(), //talvez number
    activo: z.boolean(),
})

export type TPedido = z.infer<typeof pedido>