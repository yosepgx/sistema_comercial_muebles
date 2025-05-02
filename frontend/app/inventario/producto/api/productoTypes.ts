import {z} from "zod";
const Producto = z.object({
    id: z.number(),
    umedida_sunat : z.string(),
    nombre : z.string(),
    descripcion : z.string(),
    precio : z.number(),
    categoria : z.number(),
    igv : z.number(),
    afecto_igv : z.boolean(),
    codigo_afecion_igv : z.string(),
    activo : z.boolean(),
});

export type TProducto = z.infer<typeof Producto>;
