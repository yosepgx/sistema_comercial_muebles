import { z } from "zod";

export const formPasswordSchema = z.object({
  user_id: z.number(),
  new_password: z.string().min(6, "Debe tener al menos 6 caracteres"),
  confirm_password: z.string().min(6, "Debe tener al menos 6 caracteres"),
}).refine((data) => data.new_password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Las contraseñas no coinciden",
});

export type FormPasswordData = z.infer<typeof formPasswordSchema>;