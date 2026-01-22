import { z } from "zod";

// User form schema - for creating new users
export const createUserFormSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "El email es requerido" })
      .email({ message: "Email inválido" }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/[A-Za-z]/, { message: "Debe contener al menos una letra" })
      .regex(/[0-9]/, { message: "Debe contener al menos un número" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirmá la contraseña" }),
    full_name: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
      .max(100, { message: "El nombre es muy largo" }),
    role: z.enum(["admin", "supervisor", "user"], {
      error: "Seleccioná un rol",
    }),
    position: z
      .string()
      .max(100, { message: "El cargo es muy largo" })
      .optional()
      .or(z.literal("")),
    area_id: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;

// User form schema - for editing existing users
export const updateUserFormSchema = z.object({
  full_name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre es muy largo" }),
  role: z.enum(["admin", "supervisor", "user"], {
    error: "Seleccioná un rol",
  }),
  position: z
    .string()
    .max(100, { message: "El cargo es muy largo" })
    .optional()
    .or(z.literal("")),
  area_id: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;
