import { z } from "zod";

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// Blocked file extensions
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".sh", ".cmd", ".msi", ".app"];

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// File validation function
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es muy grande. Máximo permitido: 50MB`,
    };
  }

  // Check blocked extensions
  const fileName = file.name.toLowerCase();
  for (const ext of BLOCKED_EXTENSIONS) {
    if (fileName.endsWith(ext)) {
      return {
        valid: false,
        error: `El tipo de archivo ${ext} no está permitido por seguridad`,
      };
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: "Formato de archivo no permitido. Usá PDF, DOCX, XLSX, JPG o PNG",
    };
  }

  return { valid: true };
}

// Upload document form schema
export const uploadDocumentSchema = z.object({
  title: z
    .string()
    .min(3, { message: "El título debe tener al menos 3 caracteres" })
    .max(200, { message: "El título no puede tener más de 200 caracteres" }),
  category_id: z
    .string()
    .min(1, { message: "Seleccioná una categoría" }),
  status: z.enum(["pending", "in_progress", "derived", "completed", "archived"]),
  current_area_id: z.string().optional(),
  current_user_id: z.string().optional(),
});

export type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

// Derive document form schema
export const deriveDocumentSchema = z.object({
  to_area_id: z
    .string()
    .min(1, { message: "Seleccioná un área destino" }),
  to_user_id: z.string().optional(),
  comment: z
    .string()
    .max(500, { message: "El comentario no puede tener más de 500 caracteres" })
    .optional(),
});

export type DeriveDocumentFormData = z.infer<typeof deriveDocumentSchema>;

// Export file validation
export { validateFile, ALLOWED_MIME_TYPES, BLOCKED_EXTENSIONS, MAX_FILE_SIZE };
