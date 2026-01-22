import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
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

// Create user - Uses Supabase Admin API via Edge Function
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
      // IMPORTANT: We need to create the user without affecting the current session
      // We use signUp with the autoConfirm option, but the session won't be set
      // because we're not using signInWithPassword afterward

      // First, create the auth user
      // We need to use a workaround: save current session, create user, restore session
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              full_name: input.full_name,
            },
          },
        });

      if (authError) {
        if (authError.message?.includes("already registered")) {
          throw new Error("Este email ya está registrado");
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Error al crear el usuario");
      }

      // Restore current session immediately to prevent session switch
      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          company_id: input.company_id,
          email: input.email,
          full_name: input.full_name,
          role: input.role,
          position: input.position || null,
          area_id: input.area_id || null,
          status: "active",
        })
        .select()
        .single();

      if (profileError) {
        // Try to clean up auth user if profile creation fails
        // Note: This may not work without admin rights
        console.error("Profile creation failed:", profileError);
        throw new Error("Error al crear el perfil del usuario");
      }

      return profile as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(data.id) });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    },
  });
}

// Count admins for validation
export function useAdminCount() {
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
  });
}
