import { motion } from "motion/react";
import { Settings as SettingsIcon, Moon, Sun, Monitor } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui/components/shadcn/toggle-group";
import { useThemeStore, THEME, type Theme } from "@/ui/stores/theme.store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Ajustes y preferencias de la aplicación
        </p>
      </motion.div>

      {/* Appearance Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Apariencia
            </CardTitle>
            <CardDescription>
              Personalizá cómo se ve la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Elegí entre modo claro, oscuro o automático según tu sistema
              </p>
              <ToggleGroup
                type="single"
                value={theme}
                onValueChange={(value) => value && setTheme(value as Theme)}
                className="justify-start"
              >
                <ToggleGroupItem 
                  value={THEME.LIGHT} 
                  aria-label="Modo claro" 
                  className="gap-2 data-[state=on]:bg-primary/10"
                >
                  <Sun className="h-4 w-4" />
                  <span>Claro</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value={THEME.DARK} 
                  aria-label="Modo oscuro" 
                  className="gap-2 data-[state=on]:bg-primary/10"
                >
                  <Moon className="h-4 w-4" />
                  <span>Oscuro</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value={THEME.SYSTEM} 
                  aria-label="Automático" 
                  className="gap-2 data-[state=on]:bg-primary/10"
                >
                  <Monitor className="h-4 w-4" />
                  <span>Sistema</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Próximamente Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Próximamente
            </CardTitle>
            <CardDescription>
              Más opciones de configuración en desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <SettingsIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">
                Acá vas a poder configurar notificaciones, preferencias de empresa y más.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
