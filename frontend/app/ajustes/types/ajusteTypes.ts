import {string, z} from "zod";
export const perfil = z.object({
    dni: z.string(),
    telefono: z.string()
})

export const usuario = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    groups: z.array(string()),
    perfil: perfil
  
});

export const permiso = z.object({
    id: z.number(),
    codename: z.string(),
    name: z.string(),
    content_type : z.number()
})

export const rol = z.object({
    id: z.number(),
    name: z.string(),
    permissions: z.array(permiso)
});

export const datogeneral = z.object({

});

export const sede = z.object({
    id: z.number(),
    descripcion: z.string(),
    activo: z.boolean(),
});

export type Tusuario = z.infer<typeof usuario>;
export type Trol = z.infer<typeof rol>;
export type Tdatogeneral = z.infer<typeof datogeneral>;
export type Tsede = z.infer<typeof sede>;