import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/shadcn/dialog";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Label } from "@/ui/components/shadcn/label";
import { Textarea } from "@/ui/components/shadcn/textarea";
import {
  categoryFormSchema,
  type CategoryFormData,
} from "@/ui/features/categories/schemas";
import type { Category } from "@/ui/types/database";

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isPending: boolean;
};

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isPending,
}: CategoryDialogProps) {
  const isEditing = !!category;
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      setLocalError(null);
      reset({
        name: category?.name || "",
        description: category?.description || "",
      });
    }
  }, [open, category, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    setLocalError(null);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Error al guardar la categoría"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modificá los datos de la categoría"
              : "Creá un nuevo tipo de documento"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {localError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md"
              >
                {localError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la categoría *</Label>
            <Input
              id="name"
              placeholder="Ej: Factura de compra"
              {...register("name")}
              disabled={isPending}
              aria-invalid={!!errors.name}
            />
            <AnimatePresence mode="popLayout">
              {errors.name && (
                <motion.p
                  key="name-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-destructive"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción opcional de la categoría..."
              rows={3}
              {...register("description")}
              disabled={isPending}
              aria-invalid={!!errors.description}
            />
            <AnimatePresence mode="popLayout">
              {errors.description && (
                <motion.p
                  key="description-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-destructive"
                >
                  {errors.description.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Guardando..." : "Creando..."}
                </>
              ) : isEditing ? (
                "Guardar cambios"
              ) : (
                "Crear categoría"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
