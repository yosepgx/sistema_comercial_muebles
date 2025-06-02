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
    is_active: z.boolean(),
  
});

export type Tusuario = z.infer<typeof usuario>;