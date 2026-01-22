import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tags, Plus, Search, Pencil, Trash2, Star } from "lucide-react";
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
import { Badge } from "@/ui/components/shadcn/badge";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/shadcn/tooltip";

import { useAuthStore } from "@/ui/stores/auth.store";
import { USER_ROLE, type Category } from "@/ui/types/database";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/ui/hooks/use-categories";
import {
  CategoryDialog,
  DeleteCategoryDialog,
  type CategoryFormData,
} from "@/ui/features/categories";

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

export default function CategoriesPage() {
  const profile = useAuthStore((state) => state.profile);
  const isAdmin = profile?.role === USER_ROLE.ADMIN;

  // State for dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Data fetching
  const { data: categories, isLoading, isError } = useCategories();

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Filter categories by search query
  const filteredCategories =
    categories?.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  // Handlers
  const handleCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CategoryFormData) => {
    if (!profile?.company_id) {
      throw new Error("No se encontró la empresa");
    }

    if (selectedCategory) {
      // Update
      await updateCategory.mutateAsync({
        id: selectedCategory.id,
        name: data.name,
        description: data.description || null,
      });
      toast.success("Categoría actualizada correctamente");
    } else {
      // Create
      await createCategory.mutateAsync({
        name: data.name,
        description: data.description || null,
        company_id: profile.company_id,
      });
      toast.success("Categoría creada correctamente");
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    // Don't allow deleting default categories
    if (selectedCategory.is_default) {
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await deleteCategory.mutateAsync(selectedCategory.id);
      toast.success("Categoría eliminada correctamente");
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar la categoría"
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
            <Tags className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold">Acceso Restringido</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Solo los administradores pueden gestionar categorías
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
            <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
            <p className="text-muted-foreground">Tipos de documentos</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva categoría
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Categorías de Documentos
              </CardTitle>
              <CardDescription>
                Tipos para clasificar documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
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
                  <Tags className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-destructive">
                    Error al cargar las categorías
                  </p>
                  <p className="text-sm mt-1">Intentá recargar la página</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                // Empty state
                <div className="text-center py-16 text-muted-foreground">
                  <Tags className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  {searchQuery ? (
                    <>
                      <p className="text-lg font-medium">
                        No se encontraron resultados
                      </p>
                      <p className="text-sm mt-1">
                        No hay categorías que coincidan con "{searchQuery}"
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">No hay categorías</p>
                      <p className="text-sm mt-1">
                        Creá la primera categoría de documentos
                      </p>
                      <Button
                        className="mt-4"
                        onClick={handleCreate}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear categoría
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
                        Tipo
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Creada
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredCategories.map((category, index) => (
                        <motion.tr
                          key={category.id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ delay: index * 0.05 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {category.name}
                              {category.is_default && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Categoría por defecto
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {category.description || (
                              <span className="italic opacity-50">
                                Sin descripción
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant={
                                category.is_default ? "secondary" : "outline"
                              }
                            >
                              {category.is_default ? "Sistema" : "Personalizada"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {formatDate(category.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(category)}
                                    className="h-8 w-8"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Editar categoría
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(category)}
                                    className={`h-8 w-8 ${
                                      category.is_default
                                        ? "text-muted-foreground opacity-50 cursor-not-allowed"
                                        : "text-destructive hover:text-destructive hover:bg-destructive/10"
                                    }`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {category.is_default
                                    ? "No se puede eliminar"
                                    : "Eliminar categoría"}
                                </TooltipContent>
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
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
        isPending={createCategory.isPending || updateCategory.isPending}
      />

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryName={selectedCategory?.name ?? ""}
        isDefault={selectedCategory?.is_default ?? false}
        onConfirm={handleDelete}
        isPending={deleteCategory.isPending}
      />
    </>
  );
}
