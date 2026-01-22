import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  registerSchema,
  type RegisterFormData,
} from "@/ui/features/auth/schemas";
import { useAuthStore } from "@/ui/stores/auth.store";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/components/shadcn/form";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "Al menos 8 caracteres", test: (v) => v.length >= 8 },
  { label: "Una letra", test: (v) => /[A-Za-z]/.test(v) },
  { label: "Un número", test: (v) => /[0-9]/.test(v) },
  { label: "Un símbolo (!@#$%^&*)", test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export function RegisterForm() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const passwordValue = form.watch("password");

  async function onSubmit(data: RegisterFormData) {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        companyName: data.companyName,
      });

      if (result.error) {
        setError(result.error);
        toast.error("Error al crear la cuenta", {
          description: result.error,
        });
      } else {
        toast.success("¡Cuenta creada exitosamente!", {
          description: "Redirigiendo al dashboard...",
        });
        navigate("/dashboard");
      }
    } catch {
      const errorMsg = "Ocurrió un error inesperado. Intentá de nuevo.";
      setError(errorMsg);
      toast.error("Error", { description: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <Card className="border-border/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <motion.div variants={itemVariants}>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Crear cuenta
            </CardTitle>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardDescription>
              Registrá tu empresa y comenzá a gestionar documentos
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la empresa</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Mi Empresa S.A."
                            className="pl-10"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu nombre completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Juan Pérez"
                            className="pl-10"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10"
                            autoComplete="email"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Password Requirements */}
              <AnimatePresence>
                {passwordValue && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    {passwordRequirements.map((req, index) => {
                      const isValid = req.test(passwordValue);
                      return (
                        <motion.div
                          key={req.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          {isValid ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span
                            className={
                              isValid ? "text-emerald-500" : "text-muted-foreground"
                            }
                          >
                            {req.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <motion.p
            variants={itemVariants}
            className="w-full text-center text-sm text-muted-foreground"
          >
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Ingresar
            </Link>
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
