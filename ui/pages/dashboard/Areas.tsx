import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/shadcn/table";
import { Input } from "@/ui/components/shadcn/input";
import { Button } from "@/ui/components/shadcn/button";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/shadcn/tooltip";

import { useAuthStore } from "@/ui/stores/auth.store";
import { USER_ROLE, type Area } from "@/ui/types/database";
import {
  useAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from "@/ui/hooks/use-areas";
import {
  AreaDialog,
  DeleteAreaDialog,
  type AreaFormData,
} from "@/ui/features/areas";

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

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export default function AreasPage() {
  const profile = useAuthStore((state) => state.profile);
  const isAdmin = profile?.role === USER_ROLE.ADMIN;

  // State for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Data fetching
  const { data: areas, isLoading, isError } = useAreas();

  // Mutations
  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  // Filter areas by search query
  const filteredAreas =
    areas?.filter(
      (area) =>
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  // Handlers
  const handleCreate = () => {
    setSelectedArea(null);
    setDialogOpen(true);
  };

  const handleEdit = (area: Area) => {
    setSelectedArea(area);
    setDialogOpen(true);
  };

  const handleDeleteClick = (area: Area) => {
    setSelectedArea(area);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: AreaFormData) => {
    if (!profile?.company_id) {
      throw new Error("No se encontró la empresa");
    }

    if (selectedArea) {
      // Update
      await updateArea.mutateAsync({
        id: selectedArea.id,
        name: data.name,
        description: data.description || null,
      });
      toast.success("Área actualizada correctamente");
    } else {
      // Create
      await createArea.mutateAsync({
        name: data.name,
        description: data.description || null,
        company_id: profile.company_id,
      });
      toast.success("Área creada correctamente");
    }
  };

  const handleDelete = async () => {
    if (!selectedArea) return;

    try {
      await deleteArea.mutateAsync(selectedArea.id);
      toast.success("Área eliminada correctamente");
      setDeleteDialogOpen(false);
      setSelectedArea(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el área"
      );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Access denied view
  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[50vh]"
      >
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold">Acceso Restringido</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Solo los administradores pueden gestionar áreas
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Áreas</h1>
            <p className="text-muted-foreground">
              Departamentos de tu empresa
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar áreas..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva área
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Departamentos
              </CardTitle>
              <CardDescription>
                Áreas organizacionales de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                // Error state
                <div className="text-center py-16 text-muted-foreground">
                  <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-destructive">
                    Error al cargar las áreas
                  </p>
                  <p className="text-sm mt-1">Intentá recargar la página</p>
                </div>
              ) : filteredAreas.length === 0 ? (
                // Empty state
                <div className="text-center py-16 text-muted-foreground">
                  <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  {searchQuery ? (
                    <>
                      <p className="text-lg font-medium">
                        No se encontraron resultados
                      </p>
                      <p className="text-sm mt-1">
                        No hay áreas que coincidan con "{searchQuery}"
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">No hay áreas</p>
                      <p className="text-sm mt-1">
                        Creá la primera área de tu empresa
                      </p>
                      <Button
                        className="mt-4"
                        onClick={handleCreate}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear área
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                // Table
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Descripción
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Creada
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredAreas.map((area, index) => (
                        <motion.tr
                          key={area.id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ delay: index * 0.05 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {area.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {area.description || (
                              <span className="italic opacity-50">
                                Sin descripción
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {formatDate(area.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(area)}
                                    className="h-8 w-8"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar área</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(area)}
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Eliminar área</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <AreaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        area={selectedArea}
        onSubmit={handleSubmit}
        isPending={createArea.isPending || updateArea.isPending}
      />

      <DeleteAreaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        areaName={selectedArea?.name ?? ""}
        onConfirm={handleDelete}
        isPending={deleteArea.isPending}
      />
    </>
  );
}
