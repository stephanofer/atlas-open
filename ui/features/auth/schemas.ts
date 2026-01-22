import { z } from "zod";

// =====================================================
// LOGIN SCHEMA
// =====================================================
export const loginSchema = z.object({
  email: z.email({ error: "Ingresá un email válido" }),
  password: z.string().min(1, { error: "La contraseña es requerida" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// =====================================================
// REGISTER SCHEMA
// =====================================================
export const registerSchema = z
  .object({
    companyName: z
      .string()
      .min(2, { error: "El nombre de la empresa debe tener al menos 2 caracteres" })
      .max(100, { error: "El nombre de la empresa es muy largo" }),
    fullName: z
      .string()
      .min(2, { error: "Tu nombre debe tener al menos 2 caracteres" })
      .max(100, { error: "Tu nombre es muy largo" }),
    email: z.email({ error: "Ingresá un email válido" }),
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
      .refine((val) => /[A-Za-z]/.test(val), {
        message: "La contraseña debe contener al menos una letra",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "La contraseña debe contener al menos un número",
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "La contraseña debe contener al menos un símbolo (!@#$%^&*)",
      }),
    confirmPassword: z.string().min(1, { error: "Confirmá tu contraseña" }),
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

export type RegisterFormData = z.infer<typeof registerSchema>;
