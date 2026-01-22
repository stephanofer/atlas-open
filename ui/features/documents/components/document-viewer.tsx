import { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Image,
  File,
  Download,
  Send,
  History,
  Loader2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/shadcn/dialog";
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
import { ScrollArea } from "@/ui/components/shadcn/scroll-area";
import { getStatusLabel } from "./document-status-badge";
import type { DocumentWithRelations } from "@/ui/hooks/use-documents";
import {
  useUpdateDocumentStatus,
  useTrackDocumentView,
  useTrackDocumentDownload,
  getDocumentUrl,
  downloadDocument,
} from "@/ui/hooks/use-documents";
import { useAuthStore } from "@/ui/stores/auth.store";
import { DOCUMENT_STATUS, type DocumentStatus } from "@/ui/types/database";

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

interface DocumentViewerProps {
  document: DocumentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDerive?: () => void;
  onViewHistory?: () => void;
}

export function DocumentViewer({
  document,
  open,
  onOpenChange,
  onDerive,
  onViewHistory,
}: DocumentViewerProps) {
  const { profile } = useAuthStore();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const trackViewMutation = useTrackDocumentView();
  const trackDownloadMutation = useTrackDocumentDownload();
  const updateStatusMutation = useUpdateDocumentStatus();

  // Load file URL when opening
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen && document && profile) {
      setLoadingUrl(true);
      const url = await getDocumentUrl(document.file_path);
      setFileUrl(url);
      setLoadingUrl(false);

      // Track view
      trackViewMutation.mutate({
        documentId: document.id,
        companyId: document.company_id,
        performedBy: profile.id,
      });
    } else {
      setFileUrl(null);
    }
    onOpenChange(isOpen);
  };

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

  if (!document) return null;

  const FileIcon = getFileIcon(document.mime_type);
  const isImage = document.mime_type.startsWith("image/");
  const isPdf = document.mime_type === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">{document.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {document.file_name} · {formatFileSize(document.file_size)}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden">
            {loadingUrl ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Cargando documento...</span>
              </div>
            ) : fileUrl ? (
              <>
                {isImage && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={fileUrl}
                    alt={document.title}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
                {isPdf && (
                  <iframe
                    src={`${fileUrl}#toolbar=0`}
                    className="w-full h-full"
                    title={document.title}
                  />
                )}
                {!isImage && !isPdf && (
                  <div className="text-center text-muted-foreground p-8">
                    <FileIcon className="h-16 w-16 mx-auto mb-4 opacity-40" />
                    <p className="font-medium">Vista previa no disponible</p>
                    <p className="text-sm">Descargá el archivo para verlo</p>
                    <Button className="mt-4" onClick={handleDownload} disabled={downloading}>
                      {downloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Descargar
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <FileIcon className="h-16 w-16 mx-auto mb-4 opacity-40" />
                <p>No se pudo cargar el documento</p>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="w-80 border-l bg-background flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Estado
                  </label>
                  <Select
                    value={document.status}
                    onValueChange={(v) => handleStatusChange(v as DocumentStatus)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
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
                </div>

                <Separator />

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Categoría
                  </label>
                  <p className="mt-1">{document.category?.name || "-"}</p>
                </div>

                {/* Uploaded By */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Subido por
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={document.uploaded_by_user?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(document.uploaded_by_user?.full_name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {document.uploaded_by_user?.full_name || "Usuario"}
                    </span>
                  </div>
                </div>

                {/* Current Area */}
                {document.current_area && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Área actual
                    </label>
                    <p className="mt-1">{document.current_area.name}</p>
                  </div>
                )}

                {/* Current User */}
                {document.current_user && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Asignado a
                    </label>
                    <p className="mt-1">{document.current_user.full_name}</p>
                  </div>
                )}

                <Separator />

                {/* Dates */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de subida
                  </label>
                  <p className="mt-1 text-sm">
                    {format(new Date(document.created_at), "PPP 'a las' p", {
                      locale: es,
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Última actualización
                  </label>
                  <p className="mt-1 text-sm">
                    {format(new Date(document.updated_at), "PPP 'a las' p", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-4 border-t space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Descargar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onDerive}
              >
                <Send className="mr-2 h-4 w-4" />
                Derivar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onViewHistory}
              >
                <History className="mr-2 h-4 w-4" />
                Ver Historial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
