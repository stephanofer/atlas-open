import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  User,
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
import { Badge } from "@/ui/components/shadcn/badge";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/shadcn/tooltip";
import { Avatar, AvatarFallback } from "@/ui/components/shadcn/avatar";

import { useAuthStore } from "@/ui/stores/auth.store";
import { USER_ROLE, USER_STATUS } from "@/ui/types/database";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAdminCount,
  type ProfileWithArea,
} from "@/ui/hooks/use-users";
import { useAreas } from "@/ui/hooks/use-areas";
import {
  CreateUserDialog,
  EditUserDialog,
  DeleteUserDialog,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "@/ui/features/users";

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

export default function UsersPage() {
  const profile = useAuthStore((state) => state.profile);
  const isAdmin = profile?.role === USER_ROLE.ADMIN;

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileWithArea | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Data fetching
  const { data: users, isLoading, isError } = useUsers();
  const { data: areas } = useAreas();
  const { data: adminCount } = useAdminCount();

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Filter users by search query
  const filteredUsers =
    users?.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.area?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  // Handlers
  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleEdit = (user: ProfileWithArea) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: ProfileWithArea) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (data: CreateUserFormData) => {
    if (!profile?.company_id) {
      throw new Error("No se encontró la empresa");
    }

    await createUser.mutateAsync({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role,
      position: data.position || null,
      area_id: data.area_id || null,
      company_id: profile.company_id,
    });
    toast.success("Usuario creado correctamente");
  };

  const handleUpdateSubmit = async (data: UpdateUserFormData) => {
    if (!selectedUser) return;

    await updateUser.mutateAsync({
      id: selectedUser.id,
      full_name: data.full_name,
      role: data.role,
      position: data.position || null,
      area_id: data.area_id || null,
      status: data.status,
    });
    toast.success("Usuario actualizado correctamente");
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(selectedUser.id);
      toast.success("Usuario eliminado correctamente");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar el usuario"
      );
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role icon and badge
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return {
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
          label: "Admin",
          variant: "default" as const,
        };
      case USER_ROLE.SUPERVISOR:
        return {
          icon: <Shield className="h-3.5 w-3.5" />,
          label: "Supervisor",
          variant: "secondary" as const,
        };
      default:
        return {
          icon: <User className="h-3.5 w-3.5" />,
          label: "Usuario",
          variant: "outline" as const,
        };
    }
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
            <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold">Acceso Restringido</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Solo los administradores pueden gestionar usuarios
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
            <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gestión de usuarios de tu empresa
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo usuario
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Equipo
              </CardTitle>
              <CardDescription>
                Usuarios registrados en tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                // Error state
                <div className="text-center py-16 text-muted-foreground">
                  <UsersIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-destructive">
                    Error al cargar los usuarios
                  </p>
                  <p className="text-sm mt-1">Intentá recargar la página</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                // Empty state
                <div className="text-center py-16 text-muted-foreground">
                  <UsersIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  {searchQuery ? (
                    <>
                      <p className="text-lg font-medium">
                        No se encontraron resultados
                      </p>
                      <p className="text-sm mt-1">
                        No hay usuarios que coincidan con "{searchQuery}"
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">No hay usuarios</p>
                      <p className="text-sm mt-1">
                        Creá el primer usuario de tu empresa
                      </p>
                      <Button
                        className="mt-4"
                        onClick={handleCreate}
                        variant="outline"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Crear usuario
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                // Table
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Área
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">Rol</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Estado
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.map((user, index) => {
                        const roleDisplay = getRoleDisplay(user.role);
                        const isSelf = user.id === profile?.id;
                        const isLastAdmin =
                          user.role === USER_ROLE.ADMIN &&
                          (adminCount ?? 0) <= 1;

                        return (
                          <motion.tr
                            key={user.id}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ delay: index * 0.05 }}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(user.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">
                                      {user.full_name}
                                    </p>
                                    {isSelf && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Sesión actual
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {user.email}
                                  </p>
                                  {user.position && (
                                    <p className="text-xs text-muted-foreground truncate md:hidden">
                                      {user.position}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.area?.name || (
                                <span className="text-muted-foreground italic opacity-50">
                                  Sin área
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant={roleDisplay.variant}
                                className="gap-1"
                              >
                                {roleDisplay.icon}
                                {roleDisplay.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant={
                                  user.status === USER_STATUS.ACTIVE
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  user.status === USER_STATUS.ACTIVE
                                    ? "bg-green-500/10 text-green-600 border-green-200"
                                    : "bg-gray-100 text-gray-500"
                                }
                              >
                                {user.status === USER_STATUS.ACTIVE
                                  ? "Activo"
                                  : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(user)}
                                      className="h-8 w-8"
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Editar</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Editar usuario</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteClick(user)}
                                      className={`h-8 w-8 ${
                                        isSelf || isLastAdmin
                                          ? "text-muted-foreground opacity-50 cursor-not-allowed"
                                          : "text-destructive hover:text-destructive hover:bg-destructive/10"
                                      }`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Eliminar</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isSelf
                                      ? "No podés eliminarte"
                                      : isLastAdmin
                                        ? "Único admin"
                                        : "Eliminar usuario"}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        areas={areas ?? []}
        onSubmit={handleCreateSubmit}
        isPending={createUser.isPending}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        areas={areas ?? []}
        currentUserId={profile?.id ?? ""}
        adminCount={adminCount ?? 0}
        onSubmit={handleUpdateSubmit}
        isPending={updateUser.isPending}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userName={selectedUser?.full_name ?? ""}
        isSelf={selectedUser?.id === profile?.id}
        isLastAdmin={
          selectedUser?.role === USER_ROLE.ADMIN && (adminCount ?? 0) <= 1
        }
        onConfirm={handleDelete}
        isPending={deleteUser.isPending}
      />
    </>
  );
}
