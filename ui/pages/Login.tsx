import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { LoginForm } from "@/ui/features/auth/components";
import { Logo } from "@/ui/components/brand";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 flex flex-col items-center"
          >
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo size="lg" />
            </Link>
            <p className="text-muted-foreground text-sm mt-2">
              Gestión documental empresarial
            </p>
          </motion.div>

          <LoginForm />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        © 2026 ATLAS. Todos los derechos reservados.
      </footer>
    </div>
  );
}
