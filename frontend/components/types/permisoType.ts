import {string, z} from "zod";

export const permiso = z.object({
    id: z.number(),
    codename: z.string(),
    name: z.string(),
    content_type : z.number()
})

