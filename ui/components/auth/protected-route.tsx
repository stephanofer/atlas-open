import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/ui/stores/auth.store";

export function ProtectedRoute() {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();
  const location = useLocation();

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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <Outlet />;
}
