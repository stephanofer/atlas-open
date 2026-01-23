import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
  full_name: z.string().min(2, { error: "El nombre debe tener al menos 2 caracteres" }),
  role: z.enum(["admin", "supervisor", "user"], { error: "Rol inválido" }),
  position: z.string().optional().nullable(),
  area_id: z.string().optional().nullable(),
  company_id: z.uuid({ error: "company_id inválido" }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
