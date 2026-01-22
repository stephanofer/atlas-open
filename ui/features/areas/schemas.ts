import { z } from "zod";

// Area form schema - Zod 4 syntax
export const areaFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(50, { message: "El nombre no puede tener más de 50 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/, {
      message: "Solo se permiten letras, números y espacios",
    }),
  description: z
    .string()
    .max(500, { message: "La descripción no puede tener más de 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

export type AreaFormData = z.infer<typeof areaFormSchema>;
