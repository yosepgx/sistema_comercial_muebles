import {z} from "zod"

const requisicion = z.object({
    "Codigo de producto": z.number(),
    "Nombre de Producto": z.string(),
    "Cantidad Predicha": z.number(),
    "Stock Actual": z.number(),
    "Pedidos en Transito": z.number(),
    "Cantidad Recomendada": z.number(),
    "Promedio Movil": z.number(),
    "Indices Estacionales": z.string(),
    "Factor Crecimiento": z.string(),

})

export type TRequisicion = z.infer<typeof requisicion>