import {z} from "zod";
const Producto = z.object({
    id: z.number(),
    nombre : z.string(),
    umedida_sunat : z.string(),
    descripcion : z.string(),
    categoria : z.number(),
    igv : z.number(),
    afecto_igv : z.boolean(),
    codigo_afecion_igv : z.enum(["10","20","30"]),
    es_servicio: z.boolean(),
    activo : z.boolean(),
    precio : z.number(),
    rprecio_actual: z.number().optional(),
});

const Categoria = z.object({
    id: z.number(),
    descripcion: z.string(),
    activo: z.boolean()
})



export type TProducto = z.infer<typeof Producto>;
export type TCategoria = z.infer<typeof Categoria>;
