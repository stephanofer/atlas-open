import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import { useAuthStore } from "@/ui/stores/auth.store";
import type { Area } from "@/ui/types/database";

// Query keys
export const areasKeys = {
  all: ["areas"] as const,
  list: () => [...areasKeys.all, "list"] as const,
  detail: (id: string) => [...areasKeys.all, "detail", id] as const,
};

// Fetch all areas for the current company
export function useAreas() {
  const { profile } = useAuthStore();
  
  return useQuery({
    queryKey: areasKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Area[];
    },
    enabled: !!profile?.company_id,
  });
}

// Fetch single area
export function useArea(id: string) {
  return useQuery({
    queryKey: areasKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Area;
    },
    enabled: !!id,
  });
}

// Create area
type CreateAreaInput = {
  name: string;
  description?: string | null;
  company_id: string;
};

export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAreaInput) => {
      const { data, error } = await supabase
        .from("areas")
        .insert({
          name: input.name,
          description: input.description || null,
          company_id: input.company_id,
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          throw new Error("Ya existe un área con este nombre");
        }
        throw error;
      }
      return data as Area;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: areasKeys.list() }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}

// Update area
type UpdateAreaInput = {
  id: string;
  name: string;
  description?: string | null;
};

export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAreaInput) => {
      const { data, error } = await supabase
        .from("areas")
        .update({
          name: input.name,
          description: input.description || null,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Ya existe un área con este nombre");
        }
        throw error;
      }
      return data as Area;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: areasKeys.list() }),
        queryClient.invalidateQueries({ queryKey: areasKeys.detail(data.id) }),
      ]);
    },
  });
}

// Delete area
export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First check if area has documents assigned
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("current_area_id", id);

      if (count && count > 0) {
        throw new Error(
          `No se puede eliminar el área porque tiene ${count} documento(s) asignado(s)`
        );
      }

      // Also check if area has users assigned
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("area_id", id);

      if (usersCount && usersCount > 0) {
        throw new Error(
          `No se puede eliminar el área porque tiene ${usersCount} usuario(s) asignado(s)`
        );
      }

      const { error } = await supabase.from("areas").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: areasKeys.list() }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}
