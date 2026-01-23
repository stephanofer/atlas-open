import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import { useAuthStore } from "@/ui/stores/auth.store";
import type { Profile, Area } from "@/ui/types/database";

// Query keys
export const usersKeys = {
  all: ["users"] as const,
  list: () => [...usersKeys.all, "list"] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
};

// Profile with area information
export type ProfileWithArea = Profile & {
  area?: Pick<Area, "id" | "name"> | null;
};

// Fetch all users for the current company
export function useUsers() {
  const { profile } = useAuthStore();
  
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          area:areas(id, name)
        `
        )
        .order("role", { ascending: true })
        .order("full_name", { ascending: true });

      if (error) throw error;
      return data as ProfileWithArea[];
    },
    enabled: !!profile?.company_id,
  });
}

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          area:areas(id, name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ProfileWithArea;
    },
    enabled: !!id,
  });
}

// Create user - Uses API endpoint with Supabase Admin API
type CreateUserInput = {
  email: string;
  password: string;
  full_name: string;
  role: Profile["role"];
  position?: string | null;
  area_id?: string | null;
  company_id: string;
};

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      // Call the API endpoint that uses Supabase Admin API
      // This creates the user WITHOUT affecting the current session
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          full_name: input.full_name,
          role: input.role,
          position: input.position || null,
          area_id: input.area_id || null,
          company_id: input.company_id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al crear el usuario");
      }

      return data.user as Profile;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}

// Update user profile
type UpdateUserInput = {
  id: string;
  full_name?: string;
  role?: Profile["role"];
  position?: string | null;
  area_id?: string | null;
  status?: Profile["status"];
};

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const { id, ...updates } = input;

      // If changing role from admin, verify there's at least one other active admin
      if (updates.role && updates.role !== "admin") {
        const { data: admins } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .eq("status", "active")
          .neq("id", id);

        if (!admins || admins.length === 0) {
          throw new Error(
            "No se puede cambiar el rol. Debe haber al menos un administrador activo"
          );
        }
      }

      // If deactivating user, verify it's not the last admin
      if (updates.status === "inactive") {
        const { data: currentUser } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", id)
          .single();

        if (currentUser?.role === "admin") {
          const { data: admins } = await supabase
            .from("profiles")
            .select("id")
            .eq("role", "admin")
            .eq("status", "active")
            .neq("id", id);

          if (!admins || admins.length === 0) {
            throw new Error(
              "No se puede desactivar al único administrador activo"
            );
          }
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(data.id) }),
      ]);
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if user is an admin
      const { data: user } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", id)
        .single();

      if (user?.role === "admin") {
        // Count other active admins
        const { data: admins } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .eq("status", "active")
          .neq("id", id);

        if (!admins || admins.length === 0) {
          throw new Error(
            "No se puede eliminar al único administrador activo"
          );
        }
      }

      // Check if user has documents assigned
      const { count: docsCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("current_user_id", id);

      if (docsCount && docsCount > 0) {
        throw new Error(
          `No se puede eliminar el usuario porque tiene ${docsCount} documento(s) asignado(s)`
        );
      }

      // Delete profile (this will cascade from auth.users due to FK constraint)
      const { error } = await supabase.from("profiles").delete().eq("id", id);

      if (error) throw error;

      return id;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}

// Count admins for validation
export function useAdminCount() {
  const { profile } = useAuthStore();
  
  return useQuery({
    queryKey: [...usersKeys.all, "admin-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("status", "active");

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!profile?.company_id,
  });
}
