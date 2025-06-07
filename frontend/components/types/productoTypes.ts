import {z} from "zod";


const precioSchema = z.object({
  id: z.number().int().positive(),
  valor: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "El valor debe ser un número válido mayor o igual a 0"
  }),
  fecha_inicio: z.string().datetime({
    message: "Debe ser una fecha y hora válida en formato ISO"
  }),
  fecha_fin: z.string().datetime({
    message: "Debe ser una fecha y hora válida en formato ISO"
  }),
  activo: z.boolean(),
  producto: z.number().int().positive()
});

const precioSchemaParsed = precioSchema.transform(data => ({
  ...data,
  valor: parseFloat(data.valor),
  fecha_inicio: new Date(data.fecha_inicio),
  fecha_fin: new Date(data.fecha_fin)
}));

export type TPrecio = z.infer<typeof precioSchema>;

export type TPrecioParsed = z.infer<typeof precioSchemaParsed>;

const Producto = z.object({
    id: z.number(),
    nombre : z.string(),
    umedida_sunat : z.string(),
    descripcion : z.string().nullable(),
    categoria : z.number(),
    igv : z.number(),
    afecto_igv : z.boolean(),
    codigo_afecion_igv : z.enum(["10","20","30"]),
    es_servicio: z.boolean(),
    activo : z.boolean(),
    precio : z.number(),
    rprecio_actual: z.number().optional(),
    rhistorial_precio: z.array(precioSchema).optional(),
});

const Categoria = z.object({
    id: z.number(),
    descripcion: z.string(),
    activo: z.boolean()
})

export type TProducto = z.infer<typeof Producto>;
export type TCategoria = z.infer<typeof Categoria>;
