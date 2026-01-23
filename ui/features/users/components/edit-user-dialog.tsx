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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { Switch } from "@/ui/components/shadcn/switch";
import {
  updateUserFormSchema,
  type UpdateUserFormData,
} from "@/ui/features/users/schemas";
import type { Area } from "@/ui/types/database";
import type { ProfileWithArea } from "@/ui/hooks/use-users";

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileWithArea | null;
  areas: Area[];
  currentUserId: string;
  adminCount: number;
  onSubmit: (data: UpdateUserFormData) => Promise<void>;
  isPending: boolean;
};

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  areas,
  currentUserId,
  adminCount,
  onSubmit,
  isPending,
}: EditUserDialogProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const isSelf = user?.id === currentUserId;
  const isLastAdmin = user?.role === "admin" && adminCount <= 1;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      full_name: "",
      role: "user",
      position: "",
      area_id: "",
      status: "active",
    },
  });

  const selectedRole = watch("role");
  const selectedAreaId = watch("area_id");
  const selectedStatus = watch("status");

  // Reset form when dialog opens or user changes
  useEffect(() => {
    if (open && user) {
      setLocalError(null);
      reset({
        full_name: user.full_name,
        role: user.role,
        position: user.position || "",
        area_id: user.area_id || "",
        status: user.status,
      });
    }
  }, [open, user, reset]);

  const handleFormSubmit = async (data: UpdateUserFormData) => {
    setLocalError(null);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Error al actualizar el usuario"
      );
    }
  };

  const roleLabels = {
    admin: "Administrador",
    supervisor: "Supervisor",
    user: "Usuario",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Modificá los datos y permisos de {user?.full_name}
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

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              El email no se puede modificar
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input
              id="full_name"
              placeholder="Ej: Juan Pérez"
              {...register("full_name")}
              disabled={isPending}
              aria-invalid={!!errors.full_name}
            />
            <AnimatePresence mode="popLayout">
              {errors.full_name && (
                <motion.p
                  key="full_name-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-destructive"
                >
                  {errors.full_name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Role and Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as UpdateUserFormData["role"])
                }
                disabled={isPending || (isLastAdmin && !isSelf)}
              >
                <SelectTrigger aria-invalid={!!errors.role}>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                  <SelectItem value="supervisor">
                    {roleLabels.supervisor}
                  </SelectItem>
                  <SelectItem value="user">{roleLabels.user}</SelectItem>
                </SelectContent>
              </Select>
              {isLastAdmin && (
                <p className="text-xs text-amber-600">
                  Único admin, no se puede cambiar el rol
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                placeholder="Ej: Gerente de Ventas"
                {...register("position")}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <Label>Área</Label>
            <Select
              value={selectedAreaId || "__none__"}
              onValueChange={(value) => setValue("area_id", value === "__none__" ? "" : value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin área asignada</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="status">Estado del usuario</Label>
              <p className="text-sm text-muted-foreground">
                {selectedStatus === "active"
                  ? "El usuario puede acceder al sistema"
                  : "El usuario no puede acceder al sistema"}
              </p>
            </div>
            <Switch
              id="status"
              checked={selectedStatus === "active"}
              onCheckedChange={(checked) =>
                setValue("status", checked ? "active" : "inactive")
              }
              disabled={isPending || (isLastAdmin && isSelf)}
            />
          </div>
          {isLastAdmin && isSelf && (
            <p className="text-xs text-amber-600">
              No podés desactivarte siendo el único admin
            </p>
          )}

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
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
