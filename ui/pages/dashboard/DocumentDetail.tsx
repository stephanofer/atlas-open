import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  FileText,
  Image,
  File,
  Download,
  Send,
  History,
  Loader2,
  Calendar,
  User,
  FolderOpen,
  Tag,
  Clock,
  MoreHorizontal,
  Trash2,
  ChevronRight,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ShieldX,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Separator } from "@/ui/components/shadcn/separator";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/shadcn/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/components/shadcn/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/components/shadcn/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/shadcn/alert-dialog";
import {
  useDocument,
  useUpdateDocumentStatus,
  useTrackDocumentView,
  useTrackDocumentDownload,
  useDeleteDocument,
  getDocumentUrl,
  downloadDocument,
} from "@/ui/hooks/use-documents";
import { useAuthStore } from "@/ui/stores/auth.store";
import { DOCUMENT_STATUS, type DocumentStatus } from "@/ui/types/database";
import {
  DocumentStatusBadge,
  DeriveDocumentDialog,
  DocumentHistorySheet,
  getStatusLabel,
} from "@/ui/features/documents";
import { cn } from "@/ui/lib/utils";

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType === "application/pdf") return FileText;
  return File;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Info Card Component
function InfoCard({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors",
        className
      )}
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </motion.div>
  );
}

// Document Preview Component with zoom controls
function DocumentPreview({
  fileUrl,
  mimeType,
  title,
  isLoading,
  onDownload,
}: {
  fileUrl: string | null;
  mimeType: string;
  title: string;
  isLoading: boolean;
  onDownload: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const FileIcon = getFileIcon(mimeType);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <motion.div
      variants={fadeInScale}
      className="relative flex-1 flex flex-col rounded-2xl border bg-muted/20 overflow-hidden"
    >
      {/* Preview Controls */}
      {isImage && fileUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-10 flex items-center gap-1 p-1 rounded-lg bg-background/80 backdrop-blur-sm border shadow-lg"
        >
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alejar</TooltipContent>
            </Tooltip>
            <span className="text-xs font-medium px-2 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Acercar</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotar</TooltipContent>
            </Tooltip>
            {(zoom !== 1 || rotation !== 0) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={resetView}
                  >
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restablecer vista</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </motion.div>
      )}

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10" />
            </motion.div>
            <span className="text-sm">Cargando documento...</span>
          </div>
        ) : fileUrl ? (
          <AnimatePresence mode="wait">
            {isImage ? (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-full max-h-full overflow-hidden"
              >
                <motion.img
                  src={fileUrl}
                  alt={title}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  layoutId="document-preview"
                />
              </motion.div>
            ) : isPdf ? (
              <motion.iframe
                key="pdf"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-[65vh] rounded-lg border shadow-2xl bg-white"
                title={title}
              />
            ) : (
              <motion.div
                key="unsupported"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-12 bg-card rounded-xl border"
              >
                <FileIcon className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
                <p className="font-medium text-lg mb-2">Vista previa no disponible</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Este tipo de archivo no puede previsualizarse en el navegador
                </p>
                <Button onClick={onDownload} size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar para ver
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="text-center text-muted-foreground">
            <FileIcon className="h-20 w-20 mx-auto mb-4 opacity-20" />
            <p>No se pudo cargar el documento</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deriveOpen, setDeriveOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Queries & Mutations
  const { data: document, isLoading, error } = useDocument(id || "");
  const trackViewMutation = useTrackDocumentView();
  const trackDownloadMutation = useTrackDocumentDownload();
  const updateStatusMutation = useUpdateDocumentStatus();
  const deleteMutation = useDeleteDocument();

  // Track which document we've already tracked a view for
  // This prevents duplicate view tracking when document data updates
  const trackedDocumentId = useRef<string | null>(null);

  // Load document URL and track view
  useEffect(() => {
    async function loadDocument() {
      if (document && profile) {
        setLoadingUrl(true);
        const url = await getDocumentUrl(document.file_path);
        setFileUrl(url);
        setLoadingUrl(false);

        // Only track view once per unique document
        // This prevents duplicate entries when document data refetches
        if (trackedDocumentId.current !== document.id) {
          trackedDocumentId.current = document.id;
          trackViewMutation.mutate({
            documentId: document.id,
            companyId: document.company_id,
            performedBy: profile.id,
          });
        }
      }
    }
    loadDocument();
  }, [document, profile, trackViewMutation]);

  const handleDownload = async () => {
    if (!document || !profile) return;
    setDownloading(true);

    const success = await downloadDocument(document.file_path, document.file_name);

    if (success) {
      trackDownloadMutation.mutate({
        documentId: document.id,
        companyId: document.company_id,
        performedBy: profile.id,
      });
      toast.success("Documento descargado");
    } else {
      toast.error("Error al descargar el documento");
    }

    setDownloading(false);
  };

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    if (!document || !profile) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: document.id,
        status: newStatus,
        company_id: document.company_id,
        performed_by: profile.id,
      });
      toast.success(`Estado actualizado a: ${getStatusLabel(newStatus)}`);
    } catch {
      toast.error("Error al cambiar el estado");
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    try {
      await deleteMutation.mutateAsync({
        id: document.id,
        filePath: document.file_path,
      });
      setDeleteDialogOpen(false);
      toast.success("Documento eliminado");
      navigate("/dashboard/documents", { replace: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Error al eliminar el documento. Verificá tus permisos.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state - distinguish between not found and no permission
  if (error || !document) {
    // Check if it's a permission error (RLS blocking access)
    // When RLS blocks, Supabase returns no rows (document is null) rather than an error
    const errorObj = error as { message?: string; code?: string } | null;
    const isPermissionError = errorObj?.message?.includes("permission") || 
                              errorObj?.code === "PGRST116" ||
                              errorObj?.code === "42501" ||
                              (!error && !document); // RLS silently returns no data
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
      >
        {isPermissionError ? (
          <>
            <div className="p-4 rounded-full bg-destructive/10 mb-4">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Sin permisos para ver este documento</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              No tenés acceso a este documento. Solo podés ver documentos de tu área, 
              los que te fueron asignados o los que subiste vos.
            </p>
          </>
        ) : (
          <>
            <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Documento no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              El documento que buscás no existe o fue eliminado
            </p>
          </>
        )}
        <Button asChild>
          <Link to="/dashboard/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a documentos
          </Link>
        </Button>
      </motion.div>
    );
  }

  const FileIcon = getFileIcon(document.mime_type);

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Breadcrumb */}
        <motion.div variants={itemVariants}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard/documents">Documentos</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {document.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-primary/10 rounded-xl"
            >
              <FileIcon className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{document.title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{document.file_name}</span>
                <span>·</span>
                <span>{formatFileSize(document.file_size)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Selector */}
            <Select
              value={document.status}
              onValueChange={(v) => handleStatusChange(v as DocumentStatus)}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue>
                  <DocumentStatusBadge status={document.status} />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DOCUMENT_STATUS.PENDING}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Pendiente
                  </div>
                </SelectItem>
                <SelectItem value={DOCUMENT_STATUS.IN_PROGRESS}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    En Proceso
                  </div>
                </SelectItem>
                <SelectItem value={DOCUMENT_STATUS.DERIVED}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Derivado
                  </div>
                </SelectItem>
                <SelectItem value={DOCUMENT_STATUS.COMPLETED}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Completado
                  </div>
                </SelectItem>
                <SelectItem value={DOCUMENT_STATUS.ARCHIVED}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    Archivado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHistoryOpen(true)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver historial</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Descargar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button onClick={() => setDeriveOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Derivar
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {fileUrl && (
                  <DropdownMenuItem asChild>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir en nueva pestaña
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar documento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            <DocumentPreview
              fileUrl={fileUrl}
              mimeType={document.mime_type}
              title={document.title}
              isLoading={loadingUrl}
              onDownload={handleDownload}
            />
          </div>

          {/* Info Sidebar */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Category */}
            <InfoCard icon={Tag} label="Categoría">
              {document.category?.name || "Sin categoría"}
            </InfoCard>

            {/* Uploaded By */}
            <InfoCard icon={User} label="Subido por">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={document.uploaded_by_user?.avatar_url || undefined}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(document.uploaded_by_user?.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <span>{document.uploaded_by_user?.full_name || "Usuario"}</span>
              </div>
            </InfoCard>

            {/* Current Area */}
            {document.current_area && (
              <InfoCard icon={FolderOpen} label="Área actual">
                {document.current_area.name}
              </InfoCard>
            )}

            {/* Assigned User */}
            {document.current_user && (
              <InfoCard icon={User} label="Asignado a">
                {document.current_user.full_name}
              </InfoCard>
            )}

            <Separator />

            {/* Dates */}
            <InfoCard icon={Calendar} label="Fecha de subida">
              <div>
                <p>{format(new Date(document.created_at), "PPP", { locale: es })}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(document.created_at), "p", { locale: es })}
                </p>
              </div>
            </InfoCard>

            <InfoCard icon={Clock} label="Última actualización">
              <p>
                {formatDistanceToNow(new Date(document.updated_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </InfoCard>
          </motion.div>
        </div>
      </motion.div>

      {/* Dialogs */}
      <DeriveDocumentDialog
        document={document}
        open={deriveOpen}
        onOpenChange={setDeriveOpen}
        onSuccess={() => {
          // Optionally refresh or navigate
        }}
      />

      <DocumentHistorySheet
        documentId={document.id}
        documentTitle={document.title}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento "{document.title}" 
              será eliminado permanentemente junto con todo su historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
