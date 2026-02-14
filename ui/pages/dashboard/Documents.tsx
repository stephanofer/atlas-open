import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Plus,
  File,
  Image,
  FolderOpen,
  X,
  CircleDot,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  Archive,
  LayoutList,
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
import { Separator } from "@/ui/components/shadcn/separator";
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

// Status tab configuration with icons and colors
const STATUS_TABS = [
  { 
    value: "all" as const, 
    label: "Todos", 
    icon: LayoutList,
  },
  { 
    value: DOCUMENT_STATUS.PENDING, 
    label: "Pendiente", 
    icon: Clock,
    activeClass: "text-yellow-600 dark:text-yellow-400 border-yellow-500",
    dotClass: "bg-yellow-500",
  },
  { 
    value: DOCUMENT_STATUS.IN_PROGRESS, 
    label: "En Proceso", 
    icon: CircleDot,
    activeClass: "text-blue-600 dark:text-blue-400 border-blue-500",
    dotClass: "bg-blue-500",
  },
  { 
    value: DOCUMENT_STATUS.DERIVED, 
    label: "Derivado", 
    icon: ArrowRightLeft,
    activeClass: "text-purple-600 dark:text-purple-400 border-purple-500",
    dotClass: "bg-purple-500",
  },
  { 
    value: DOCUMENT_STATUS.COMPLETED, 
    label: "Completado", 
    icon: CheckCircle2,
    activeClass: "text-green-600 dark:text-green-400 border-green-500",
    dotClass: "bg-green-500",
  },
  { 
    value: DOCUMENT_STATUS.ARCHIVED, 
    label: "Archivado", 
    icon: Archive,
    activeClass: "text-gray-600 dark:text-gray-400 border-gray-500",
    dotClass: "bg-gray-500",
  },
] as const;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      duration: 0.15,
      staggerChildren: 0.02,
      when: "beforeChildren" as const
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.15 }
  },
};

const chipVariants = {
  initial: { opacity: 0, scale: 0.8, x: -8 },
  animate: { opacity: 1, scale: 1, x: 0, transition: { type: "spring" as const, stiffness: 500, damping: 30 } },
  exit: { opacity: 0, scale: 0.8, x: -8, transition: { duration: 0.15 } },
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
      if (
        searchQuery &&
        !doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && doc.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "all" && doc.category_id !== categoryFilter) {
        return false;
      }
      if (areaFilter !== "all" && doc.current_area_id !== areaFilter) {
        return false;
      }
      return true;
    });
  }, [documents, searchQuery, statusFilter, categoryFilter, areaFilter]);

  // Count documents per status for tab badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    for (const doc of documents) {
      counts[doc.status] = (counts[doc.status] || 0) + 1;
    }
    return counts;
  }, [documents]);

  const hasSecondaryFilters =
    categoryFilter !== "all" || areaFilter !== "all";

  const hasActiveFilters =
    statusFilter !== "all" || hasSecondaryFilters;

  const activeSecondaryCount = [categoryFilter, areaFilter].filter(
    (f) => f !== "all"
  ).length;

  // Build active filter chips for display
  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (categoryFilter !== "all") {
    const cat = categories.find((c) => c.id === categoryFilter);
    activeChips.push({
      key: "category",
      label: `Categoría: ${cat?.name || "..."}`,
      onRemove: () => setCategoryFilter("all"),
    });
  }
  if (areaFilter !== "all") {
    const area = areas.find((a) => a.id === areaFilter);
    activeChips.push({
      key: "area",
      label: `Área: ${area?.name || "..."}`,
      onRemove: () => setAreaFilter("all"),
    });
  }
  if (searchQuery) {
    activeChips.push({
      key: "search",
      label: `Búsqueda: "${searchQuery}"`,
      onRemove: () => setSearchQuery(""),
    });
  }

  const clearAllFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setAreaFilter("all");
    setSearchQuery("");
  };

  const handleDocumentClick = (doc: DocumentWithRelations) => {
    navigate(`/dashboard/documents/${doc.id}`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
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

      {/* Filter Toolbar */}
      <motion.div
        variants={itemVariants}
        className="space-y-3"
      >
        {/* Top row: Search + Secondary Filters + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search with clear */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por título..."
              className="pl-10 pr-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            {/* Secondary Filters Popover */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className={cn(
                    "gap-2",
                    hasSecondaryFilters && "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeSecondaryCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 px-1.5 text-xs font-semibold bg-primary text-primary-foreground"
                    >
                      {activeSecondaryCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <div className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Filtrar por</h4>
                    {hasSecondaryFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCategoryFilter("all");
                          setAreaFilter("all");
                        }}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="p-4 space-y-4">
                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Categoría
                    </label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="h-9">
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Área
                    </label>
                    <Select value={areaFilter} onValueChange={setAreaFilter}>
                      <SelectTrigger className="h-9">
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
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none h-9 w-9"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none h-9 w-9"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Tabs Row */}
        <div className="flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count = statusCounts[tab.value] ?? 0;
            const Icon = tab.icon;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value as DocumentStatus | "all")}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200",
                  "hover:bg-accent/60",
                  isActive
                    ? tab.value === "all"
                      ? "bg-accent text-foreground shadow-sm"
                      : `bg-accent/80 shadow-sm ${tab.activeClass}`
                    : "text-muted-foreground"
                )}
              >
                {tab.value !== "all" && tab.dotClass && (
                  <span className={cn(
                    "h-2 w-2 rounded-full transition-opacity duration-200",
                    tab.dotClass,
                    isActive ? "opacity-100" : "opacity-40"
                  )} />
                )}
                {tab.value === "all" && <Icon className="h-3.5 w-3.5" />}
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-xs tabular-nums ml-0.5 transition-colors duration-200",
                    isActive ? "opacity-80" : "text-muted-foreground/60"
                  )}>
                    {count}
                  </span>
                )}
                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="status-tab-indicator"
                    className={cn(
                      "absolute bottom-0 left-2 right-2 h-0.5 rounded-full",
                      tab.value === "all" ? "bg-foreground" : tab.dotClass
                    )}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {activeChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 flex-wrap overflow-hidden"
            >
              <span className="text-xs text-muted-foreground font-medium">
                Filtros activos:
              </span>
              <AnimatePresence mode="popLayout">
                {activeChips.map((chip) => (
                  <motion.div
                    key={chip.key}
                    variants={chipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1 pl-2.5 pr-1 py-0.5 text-xs font-normal cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={chip.onRemove}
                    >
                      {chip.label}
                      <span className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors">
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {activeChips.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar todo
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results info bar */}
      {!isLoading && documents.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length === documents.length ? (
              <span>{documents.length} documento{documents.length !== 1 ? "s" : ""}</span>
            ) : (
              <span>
                {filteredDocuments.length} de {documents.length} documento{documents.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </motion.div>
      )}

      {/* Documents Grid/List */}
      <div>
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
                        onClick={clearAllFilters}
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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
        )}
      </div>
    </motion.div>
  );
}
