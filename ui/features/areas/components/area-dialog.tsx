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
import { areaFormSchema, type AreaFormData } from "@/ui/features/areas/schemas";
import type { Area } from "@/ui/types/database";

type AreaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: Area | null;
  onSubmit: (data: AreaFormData) => Promise<void>;
  isPending: boolean;
};

export function AreaDialog({
  open,
  onOpenChange,
  area,
  onSubmit,
  isPending,
}: AreaDialogProps) {
  const isEditing = !!area;
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when dialog opens/closes or area changes
  useEffect(() => {
    if (open) {
      setLocalError(null);
      reset({
        name: area?.name || "",
        description: area?.description || "",
      });
    }
  }, [open, area, reset]);

  const handleFormSubmit = async (data: AreaFormData) => {
    setLocalError(null);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Error al guardar el área"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar área" : "Nueva área"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modificá los datos del área"
              : "Creá un nuevo departamento para tu empresa"}
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
            <Label htmlFor="name">Nombre del área *</Label>
            <Input
              id="name"
              placeholder="Ej: Recursos Humanos"
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
              placeholder="Descripción opcional del área..."
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
                "Crear área"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
