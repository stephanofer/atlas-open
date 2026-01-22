import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginFormData } from "@/ui/features/auth/schemas";
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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LoginForm() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        setError(result.error);
        // Also show toast for immediate feedback
        toast.error("Error al iniciar sesión", {
          description: result.error,
        });
      } else {
        toast.success("¡Bienvenido de vuelta!", {
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
              Bienvenido de vuelta
            </CardTitle>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardDescription>
              Ingresá tus credenciales para acceder a tu cuenta
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            autoComplete="current-password"
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
                      Ingresando...
                    </>
                  ) : (
                    "Ingresar"
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
            ¿No tenés cuenta?{" "}
            <Link
              to="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Registrate
            </Link>
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
