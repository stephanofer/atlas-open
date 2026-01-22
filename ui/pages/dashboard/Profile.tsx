import { useState, useRef, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
  User,
  Building2,
  Briefcase,
  Shield,
  Save,
  Loader2,
  Calendar,
  MapPin,
  Camera,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/ui/stores/auth.store";
import { supabase } from "@/ui/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Separator } from "@/ui/components/shadcn/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Badge } from "@/ui/components/shadcn/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/components/shadcn/form";

const profileSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  position: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  user: "Usuario",
};

const roleBadgeColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  supervisor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  user: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export default function ProfilePage() {
  const { profile, setProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch company name
  const { data: company } = useQuery({
    queryKey: ["company", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      const { data } = await supabase
        .from("companies")
        .select("name")
        .eq("id", profile.company_id)
        .single();
      return data;
    },
    enabled: !!profile?.company_id,
  });

  // Fetch area name
  const { data: area } = useQuery({
    queryKey: ["area", profile?.area_id],
    queryFn: async () => {
      if (!profile?.area_id) return null;
      const { data } = await supabase
        .from("areas")
        .select("name")
        .eq("id", profile.area_id)
        .single();
      return data;
    },
    enabled: !!profile?.area_id,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      position: profile?.position || "",
    },
  });

  async function onSubmit(data: ProfileFormData) {
    if (!profile?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          position: data.position || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: data.full_name,
        position: data.position || null,
      });

      toast.success("Perfil actualizado", {
        description: "Tus datos fueron guardados correctamente.",
      });
    } catch {
      toast.error("Error al guardar", {
        description: "No se pudo actualizar el perfil. Intentá de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile?.id || !profile?.company_id) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato no permitido", {
        description: "Solo se permiten imágenes JPG, PNG, WebP o GIF.",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Archivo muy grande", {
        description: "El tamaño máximo es 2MB.",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Generate unique filename: user_id/avatar.ext
      // Matches RLS policy: (storage.foldername(name))[1] = auth.uid()::text
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${profile.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache buster to force reload
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile({
        ...profile,
        avatar_url: avatarUrl,
      });

      toast.success("Avatar actualizado", {
        description: "Tu foto de perfil fue guardada correctamente.",
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Error al subir imagen", {
        description: "No se pudo actualizar el avatar. Intentá de nuevo.",
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestioná tu información personal
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Avatar & Quick Info */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar with upload overlay */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    {profile?.avatar_url ? (
                      <AvatarImage 
                        src={profile.avatar_url} 
                        alt={profile.full_name || "Avatar"} 
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                      {profile?.full_name ? getInitials(profile.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Upload overlay */}
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                    aria-label="Cambiar avatar"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    onChange={handleAvatarChange}
                    className="hidden"
                    aria-label="Seleccionar imagen de avatar"
                  />
                </div>

                <div className="mt-4 space-y-1">
                  <h2 className="text-lg font-semibold">{profile?.full_name || "Usuario"}</h2>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge 
                    variant="outline" 
                    className={roleBadgeColors[profile?.role || "user"]}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {roleLabels[profile?.role || "user"]}
                  </Badge>
                  
                  {profile?.position && (
                    <Badge variant="outline" className="bg-background">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {profile.position}
                    </Badge>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="w-full space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{company?.name || "—"}</span>
                  </div>
                  {area && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{area.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Desde {formatDate(profile?.created_at)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4 mr-2" />
                  )}
                  Cambiar foto
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Edit Form & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualizá tus datos de perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tu nombre completo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Email</FormLabel>
                      <Input
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        El email no se puede modificar
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Gerente de Ventas"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Details */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Detalles de la Cuenta
                </CardTitle>
                <CardDescription>
                  Información de tu empresa y cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Empresa
                    </p>
                    <p className="font-medium">{company?.name || "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Área
                    </p>
                    <p className="font-medium">{area?.name || "Sin asignar"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </p>
                    <Badge 
                      variant="outline" 
                      className={profile?.status === "active" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                      }
                    >
                      {profile?.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rol
                    </p>
                    <p className="font-medium">{roleLabels[profile?.role || "user"]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
