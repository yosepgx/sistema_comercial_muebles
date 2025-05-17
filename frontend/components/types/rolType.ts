import {string, z} from "zod";
import { permiso } from "./permisoType";

export const rol = z.object({
    id: z.number(),
    name: z.string(),
    permissions: z.array(permiso)
});

export type Trol = z.infer<typeof rol>;
