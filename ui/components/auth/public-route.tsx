import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/ui/stores/auth.store";

/**
 * Redirect authenticated users away from auth pages (login/register)
 */
export function PublicRoute() {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render public content
  return <Outlet />;
}
