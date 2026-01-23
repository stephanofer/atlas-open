import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  File,
  Image,
  FolderOpen,
  X,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
} from "@/ui/components/shadcn/card";
import { Input } from "@/ui/components/shadcn/input";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/shadcn/popover";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { useDocuments, type DocumentWithRelations } from "@/ui/hooks/use-documents";
import { useCategories } from "@/ui/hooks/use-categories";
import { useAreas } from "@/ui/hooks/use-areas";
import { 
  DocumentStatusBadge,
} from "@/ui/features/documents";
import { DOCUMENT_STATUS, type DocumentStatus } from "@/ui/types/database";
import { cn } from "@/ui/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
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

interface DocumentCardProps {
  document: DocumentWithRelations;
  viewMode: "grid" | "list";
  onClick: () => void;
}

function DocumentCard({ document, viewMode, onClick }: DocumentCardProps) {
  const FileIcon = getFileIcon(document.mime_type);

  if (viewMode === "list") {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{document.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{document.category?.name}</span>
            <span>·</span>
            <span>{formatFileSize(document.file_size)}</span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {document.current_area && (
            <Badge variant="outline" className="text-xs">
              {document.current_area.name}
            </Badge>
          )}
          <DocumentStatusBadge status={document.status} />
        </div>
        <div className="text-sm text-muted-foreground hidden sm:block">
          {formatDistanceToNow(new Date(document.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col rounded-lg border bg-card overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      {/* File Preview Area */}
      <div className="h-32 bg-muted/30 flex items-center justify-center relative">
        <FileIcon className="h-12 w-12 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
        <div className="absolute top-2 right-2">
          <DocumentStatusBadge status={document.status} className="text-xs" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1">
        <h3 className="font-medium truncate text-sm">{document.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {document.category?.name}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarImage src={document.uploaded_by_user?.avatar_url || undefined} />
            <AvatarFallback className="text-[8px]">
              {getInitials(document.uploaded_by_user?.full_name || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {document.uploaded_by_user?.full_name?.split(" ")[0]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(document.created_at), "dd MMM", { locale: es })}
        </span>
      </div>
    </motion.div>
  );
}

function DocumentSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg border">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Queries
  const { data: documents = [], isLoading } = useDocuments();
  const { data: categories = [] } = useCategories();
  const { data: areas = [] } = useAreas();

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter
      if (
        searchQuery &&
        !doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && doc.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && doc.category_id !== categoryFilter) {
        return false;
      }

      // Area filter
      if (areaFilter !== "all" && doc.current_area_id !== areaFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, statusFilter, categoryFilter, areaFilter]);

  const hasActiveFilters =
    statusFilter !== "all" || categoryFilter !== "all" || areaFilter !== "all";

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setAreaFilter("all");
  };

  const handleDocumentClick = (doc: DocumentWithRelations) => {
    navigate(`/dashboard/documents/${doc.id}`);
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de documentos
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/upload">
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </Link>
          </Button>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* Filter Popover */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(hasActiveFilters && "border-primary text-primary")}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge className="ml-2 h-5 w-5 p-0 justify-center">
                      {[statusFilter, categoryFilter, areaFilter].filter(
                        (f) => f !== "all"
                      ).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filtros</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 text-xs"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Limpiar
                      </Button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as DocumentStatus | "all")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value={DOCUMENT_STATUS.PENDING}>
                          Pendiente
                        </SelectItem>
                        <SelectItem value={DOCUMENT_STATUS.IN_PROGRESS}>
                          En Proceso
                        </SelectItem>
                        <SelectItem value={DOCUMENT_STATUS.DERIVED}>
                          Derivado
                        </SelectItem>
                        <SelectItem value={DOCUMENT_STATUS.COMPLETED}>
                          Completado
                        </SelectItem>
                        <SelectItem value={DOCUMENT_STATUS.ARCHIVED}>
                          Archivado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Area Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Área</label>
                    <Select value={areaFilter} onValueChange={setAreaFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las áreas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "space-y-2"
              )}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <DocumentSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  {documents.length === 0 ? (
                    <>
                      <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No hay documentos aún</p>
                      <p className="text-sm mt-1">
                        Los documentos que subas aparecerán acá
                      </p>
                      <Button className="mt-4" asChild>
                        <Link to="/dashboard/upload">Subir documento</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">
                        No se encontraron documentos
                      </p>
                      <p className="text-sm mt-1">
                        Probá con otros términos de búsqueda o filtros
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={clearFilters}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "space-y-2"
                )}
              >
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    viewMode={viewMode}
                    onClick={() => handleDocumentClick(doc)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* Results Count */}
        {!isLoading && filteredDocuments.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="text-sm text-muted-foreground text-center"
          >
            {filteredDocuments.length} documento
            {filteredDocuments.length !== 1 && "s"}
            {hasActiveFilters && " (filtrados)"}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
