import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import { useAuthStore } from "@/ui/stores/auth.store";
import type { Category } from "@/ui/types/database";

// Query keys
export const categoriesKeys = {
  all: ["categories"] as const,
  list: () => [...categoriesKeys.all, "list"] as const,
  detail: (id: string) => [...categoriesKeys.all, "detail", id] as const,
};

// Fetch all categories for the current company
export function useCategories() {
  const { profile } = useAuthStore();
  
  return useQuery({
    queryKey: categoriesKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!profile?.company_id,
  });
}

// Fetch single category
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!id,
  });
}

// Create category
type CreateCategoryInput = {
  name: string;
  description?: string | null;
  company_id: string;
};

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: input.name,
          description: input.description || null,
          company_id: input.company_id,
          is_default: false,
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          throw new Error("Ya existe una categoría con este nombre");
        }
        throw error;
      }
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    },
  });
}

// Update category
type UpdateCategoryInput = {
  id: string;
  name: string;
  description?: string | null;
};

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: input.name,
          description: input.description || null,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Ya existe una categoría con este nombre");
        }
        throw error;
      }
      return data as Category;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.detail(data.id),
      });
    },
  });
}

// Delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First check if category has documents assigned
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

      if (count && count > 0) {
        throw new Error(
          `No se puede eliminar la categoría porque tiene ${count} documento(s) asignado(s)`
        );
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    },
  });
}
