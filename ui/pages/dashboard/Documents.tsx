import { motion } from "motion/react";
import { FileText, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import { Input } from "@/ui/components/shadcn/input";
import { Button } from "@/ui/components/shadcn/button";

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

export default function DocumentsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Gestión y seguimiento de documentos
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar documentos..." className="pl-10" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bandeja de Documentos
            </CardTitle>
            <CardDescription>
              Todos los documentos de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No hay documentos aún</p>
              <p className="text-sm mt-1">
                Los documentos que subas aparecerán acá
              </p>
              <Button className="mt-4" asChild>
                <a href="/dashboard/upload">Subir documento</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
