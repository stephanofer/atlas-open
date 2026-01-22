import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, Users, FolderOpen, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/ui/stores/auth.store";
import { Button } from "@/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";

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

const stats = [
  {
    title: "Documentos",
    value: "0",
    description: "Total en el sistema",
    icon: FileText,
  },
  {
    title: "Usuarios",
    value: "1",
    description: "Activos en tu empresa",
    icon: Users,
  },
  {
    title: "Áreas",
    value: "0",
    description: "Departamentos creados",
    icon: FolderOpen,
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ATLAS</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.full_name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tight">
              ¡Bienvenido, {profile?.full_name?.split(" ")[0]}!
            </h2>
            <p className="text-muted-foreground mt-1">
              Este es tu panel de control. Desde acá podés gestionar todos tus
              documentos.
            </p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            variants={itemVariants}
            className="grid gap-4 md:grid-cols-3"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Próximos pasos</CardTitle>
                <CardDescription>
                  Configurá tu empresa para empezar a usar ATLAS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Crear áreas</p>
                    <p className="text-sm text-muted-foreground">
                      Definí los departamentos de tu empresa
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Agregar usuarios</p>
                    <p className="text-sm text-muted-foreground">
                      Invitá a tu equipo a usar ATLAS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Subir documentos</p>
                    <p className="text-sm text-muted-foreground">
                      Empezá a gestionar tus archivos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
