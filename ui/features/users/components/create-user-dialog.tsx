import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
import {
  createUserFormSchema,
  type CreateUserFormData,
} from "@/ui/features/users/schemas";
import type { Area } from "@/ui/types/database";

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: Area[];
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isPending: boolean;
};

export function CreateUserDialog({
  open,
  onOpenChange,
  areas,
  onSubmit,
  isPending,
}: CreateUserDialogProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      role: "user",
      position: "",
      area_id: "",
    },
  });

  const selectedRole = watch("role");
  const selectedAreaId = watch("area_id");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setLocalError(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      reset({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        role: "user",
        position: "",
        area_id: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: CreateUserFormData) => {
    setLocalError(null);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Error al crear el usuario"
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
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Creá una cuenta para un miembro de tu empresa
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

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              {...register("email")}
              disabled={isPending}
              aria-invalid={!!errors.email}
            />
            <AnimatePresence mode="popLayout">
              {errors.email && (
                <motion.p
                  key="email-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-destructive"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  disabled={isPending}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <AnimatePresence mode="popLayout">
                {errors.password && (
                  <motion.p
                    key="password-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-destructive"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repetí la contraseña"
                  {...register("confirmPassword")}
                  disabled={isPending}
                  aria-invalid={!!errors.confirmPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <AnimatePresence mode="popLayout">
                {errors.confirmPassword && (
                  <motion.p
                    key="confirmPassword-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-destructive"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Role and Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as CreateUserFormData["role"])
                }
                disabled={isPending}
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
              <AnimatePresence mode="popLayout">
                {errors.role && (
                  <motion.p
                    key="role-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-destructive"
                  >
                    {errors.role.message}
                  </motion.p>
                )}
              </AnimatePresence>
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
              value={selectedAreaId || ""}
              onValueChange={(value) => setValue("area_id", value || "")}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin área asignada</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  Creando...
                </>
              ) : (
                "Crear usuario"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
