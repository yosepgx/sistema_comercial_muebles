import {z} from "zod";

const isoDateStringSchema = z.string().refine(val => {
  try {
    new Date(val);
    return true;
  } catch {
    return false;
  }
}, {
  message: "Debe ser una fecha válida en formato ISO"
});

const precioSchema = z.object({
  id: z.number().int().positive(),
  valor: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "El valor debe ser un número válido mayor o igual a 0"
  }),
  fecha_inicio: isoDateStringSchema.transform(val => new Date(val)),
  fecha_fin: isoDateStringSchema.transform(val => new Date(val)),

  activo: z.boolean(),
  producto: z.number().int().positive()
});

const precioSchemaParsed = precioSchema.transform(data => ({
  ...data,
  valor: parseFloat(data.valor),
  fecha_inicio: new Date(data.fecha_inicio).toISOString(),
  fecha_fin: new Date(data.fecha_fin).toISOString()
}));

export type TPrecio = z.infer<typeof precioSchema>;

export type TPrecioParsed = z.infer<typeof precioSchemaParsed>;

const Categoria = z.object({
    id: z.number(),
    descripcion: z.string(),
    activo: z.boolean()
})

export const Producto = z.object({
    id: z.number(),
    nombre : z.string(),
    umedida_sunat : z.string(),
    descripcion : z.string().nullable(),
    categoria : z.number(),
    igv : z.coerce.number(),
    afecto_igv : z.boolean(),
    codigo_afecion_igv : z.enum(["10","20","30"]),
    es_servicio: z.boolean(),
    activo : z.boolean(),
    rprecio_actual: z.coerce.number().optional(),
    rhistorial_precio: z.array(precioSchema).optional(),
    rstock: z.coerce.number().optional(),
    rcategoria_producto: Categoria.optional(),
});

export type TProducto = z.infer<typeof Producto>;
export type TCategoria = z.infer<typeof Categoria>;
