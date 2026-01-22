import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  File,
  FileText,
  Image,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/components/shadcn/form";
import { useCategories } from "@/ui/hooks/use-categories";
import { useAreas } from "@/ui/hooks/use-areas";
import { useUsers } from "@/ui/hooks/use-users";
import { useUploadDocument } from "@/ui/hooks/use-documents";
import { useAuthStore } from "@/ui/stores/auth.store";
import {
  uploadDocumentSchema,
  validateFile,
} from "@/ui/features/documents/schemas";
import { cn } from "@/ui/lib/utils";
import { DOCUMENT_STATUS } from "@/ui/types/database";

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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return Image;
  }
  if (mimeType === "application/pdf") {
    return FileText;
  }
  return File;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: areas = [], isLoading: areasLoading } = useAreas();
  const { data: users = [] } = useUsers();
  const uploadMutation = useUploadDocument();

  // Filter users by selected area
  const filteredUsers = selectedAreaId
    ? users.filter((u) => u.area_id === selectedAreaId && u.status === "active")
    : users.filter((u) => u.status === "active");

  // Form
  const form = useForm({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      title: "",
      category_id: "",
      status: "pending" as const,
      current_area_id: "",
      current_user_id: "",
    },
  });

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error || "Archivo no válido");
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
    // Auto-fill title if empty
    if (!form.getValues("title")) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("title", nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: {
    title: string;
    category_id: string;
    status: "pending" | "in_progress" | "derived" | "completed" | "archived";
    current_area_id?: string;
    current_user_id?: string;
  }) => {
    if (!selectedFile) {
      setFileError("Seleccioná un archivo para subir");
      return;
    }

    if (!profile?.company_id || !profile?.id) {
      toast.error("Error de sesión. Recargá la página.");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        title: data.title,
        category_id: data.category_id,
        status: data.status,
        current_area_id: data.current_area_id || null,
        current_user_id: data.current_user_id || null,
        company_id: profile.company_id,
        uploaded_by: profile.id,
      });

      toast.success("Documento subido correctamente");
      navigate("/dashboard/documents");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir el documento. Intentá de nuevo.");
    }
  };

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : UploadIcon;

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Drop Zone */}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileInputChange}
                />

                <AnimatePresence mode="wait">
                  {!selectedFile ? (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 cursor-pointer",
                        isDragging
                          ? "border-primary bg-primary/5 scale-[1.02]"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                      )}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <motion.div
                        animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      </motion.div>
                      <p className="text-lg font-medium">
                        {isDragging
                          ? "Soltá el archivo acá"
                          : "Arrastrá archivos acá o hacé clic para seleccionar"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, Word, Excel o imágenes
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file-preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border rounded-lg p-4 bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <FileIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </motion.div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {fileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {fileError}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Document Details */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Documento</CardTitle>
                <CardDescription>
                  Completá la información del documento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Factura Enero 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={categoriesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={DOCUMENT_STATUS.PENDING}>
                              Pendiente
                            </SelectItem>
                            <SelectItem value={DOCUMENT_STATUS.IN_PROGRESS}>
                              En Proceso
                            </SelectItem>
                            <SelectItem value={DOCUMENT_STATUS.COMPLETED}>
                              Completado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Area and User */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="current_area_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Destino</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedAreaId(value);
                            // Reset user when area changes
                            form.setValue("current_user_id", "");
                          }}
                          value={field.value}
                          disabled={areasLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar área (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="current_user_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario Destino</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedAreaId && filteredUsers.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar usuario (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            variants={itemVariants}
            className="flex justify-end gap-3"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/documents")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending || !selectedFile}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Subir Documento
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
