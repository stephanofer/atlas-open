import { motion } from "motion/react";
import { Upload as UploadIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
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

export default function UploadPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Subir Documento</h1>
        <p className="text-muted-foreground">
          Cargá archivos para gestionar en el sistema
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Cargar Archivo
            </CardTitle>
            <CardDescription>
              Formatos permitidos: PDF, DOCX, XLSX, JPG, PNG (máx. 50MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">
                Arrastrá archivos acá o hacé clic para seleccionar
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Podés subir múltiples archivos a la vez
              </p>
              <Button className="mt-4">
                Seleccionar archivos
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Esta funcionalidad está en desarrollo</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
