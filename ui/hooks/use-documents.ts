import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import type {
  Document,
  DocumentHistory,
  DocumentStatus,
  HistoryActionType,
} from "@/ui/types/database";

// Extended Document type with relations
export interface DocumentWithRelations extends Document {
  category?: { id: string; name: string } | null;
  current_area?: { id: string; name: string } | null;
  current_user?: { id: string; full_name: string } | null;
  uploaded_by_user?: { id: string; full_name: string; avatar_url: string | null } | null;
}

// Extended History type with relations
export interface DocumentHistoryWithRelations extends DocumentHistory {
  performed_by_user?: { id: string; full_name: string; avatar_url: string | null } | null;
  from_area?: { id: string; name: string } | null;
  to_area?: { id: string; name: string } | null;
  to_user?: { id: string; full_name: string } | null;
}

// Query keys
export const documentsKeys = {
  all: ["documents"] as const,
  list: (filters?: DocumentFilters) => [...documentsKeys.all, "list", filters] as const,
  detail: (id: string) => [...documentsKeys.all, "detail", id] as const,
  history: (id: string) => [...documentsKeys.all, "history", id] as const,
};

// Filter types
export interface DocumentFilters {
  search?: string;
  status?: DocumentStatus;
  category_id?: string;
  area_id?: string;
  user_id?: string;
}

// Fetch all documents for the current company with optional filters
export function useDocuments(filters?: DocumentFilters) {
  return useQuery({
    queryKey: documentsKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select(`
          *,
          category:categories(id, name),
          current_area:areas!documents_current_area_id_fkey(id, name),
          current_user:profiles!documents_current_user_id_fkey(id, full_name),
          uploaded_by_user:profiles!documents_uploaded_by_fkey(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters?.area_id) {
        query = query.eq("current_area_id", filters.area_id);
      }
      if (filters?.user_id) {
        query = query.eq("current_user_id", filters.user_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DocumentWithRelations[];
    },
  });
}

// Fetch single document with all relations
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          category:categories(id, name),
          current_area:areas!documents_current_area_id_fkey(id, name),
          current_user:profiles!documents_current_user_id_fkey(id, full_name),
          uploaded_by_user:profiles!documents_uploaded_by_fkey(id, full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as DocumentWithRelations;
    },
    enabled: !!id,
  });
}

// Fetch document history
export function useDocumentHistory(documentId: string) {
  return useQuery({
    queryKey: documentsKeys.history(documentId),
    queryFn: async () => {
      // Fetch history records
      const { data, error } = await supabase
        .from("document_history")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related data separately to avoid FK issues
      const historyWithRelations: DocumentHistoryWithRelations[] = await Promise.all(
        (data || []).map(async (record) => {
          // Fetch performed_by user
          let performed_by_user = null;
          if (record.performed_by) {
            const { data: user } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", record.performed_by)
              .maybeSingle();
            performed_by_user = user;
          }

          // Fetch from_area
          let from_area = null;
          if (record.from_area_id) {
            const { data: area } = await supabase
              .from("areas")
              .select("id, name")
              .eq("id", record.from_area_id)
              .maybeSingle();
            from_area = area;
          }

          // Fetch to_area
          let to_area = null;
          if (record.to_area_id) {
            const { data: area } = await supabase
              .from("areas")
              .select("id, name")
              .eq("id", record.to_area_id)
              .maybeSingle();
            to_area = area;
          }

          // Fetch to_user
          let to_user = null;
          if (record.to_user_id) {
            const { data: user } = await supabase
              .from("profiles")
              .select("id, full_name")
              .eq("id", record.to_user_id)
              .maybeSingle();
            to_user = user;
          }

          return {
            ...record,
            performed_by_user,
            from_area,
            to_area,
            to_user,
          };
        })
      );

      return historyWithRelations;
    },
    enabled: !!documentId,
  });
}

// Upload document input type
export interface UploadDocumentInput {
  file: File;
  title: string;
  category_id: string;
  status?: DocumentStatus;
  current_area_id?: string | null;
  current_user_id?: string | null;
  company_id: string;
  uploaded_by: string;
}

// Upload document mutation
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadDocumentInput) => {
      // 1. Upload file to Storage
      const fileExt = input.file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${input.company_id}/documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, input.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Error al subir el archivo. Intentá de nuevo.");
      }

      // 2. Create document record
      const { data: document, error: docError } = await supabase
        .from("documents")
        .insert({
          title: input.title,
          category_id: input.category_id,
          file_path: filePath,
          file_name: input.file.name,
          file_size: input.file.size,
          mime_type: input.file.type,
          status: input.status || "pending",
          current_area_id: input.current_area_id || null,
          current_user_id: input.current_user_id || null,
          company_id: input.company_id,
          uploaded_by: input.uploaded_by,
        })
        .select()
        .single();

      if (docError) {
        // Try to clean up the uploaded file
        await supabase.storage.from("documents").remove([filePath]);
        throw docError;
      }

      // 3. Create history record
      const { error: historyError } = await supabase
        .from("document_history")
        .insert({
          document_id: document.id,
          company_id: input.company_id,
          action_type: "uploaded" as HistoryActionType,
          performed_by: input.uploaded_by,
          to_area_id: input.current_area_id || null,
          to_user_id: input.current_user_id || null,
          comment: `Documento subido: ${input.title}`,
        });

      if (historyError) {
        console.warn("History creation error:", historyError);
      }

      return document as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
    },
  });
}

// Update document status
export interface UpdateDocumentStatusInput {
  id: string;
  status: DocumentStatus;
  company_id: string;
  performed_by: string;
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDocumentStatusInput) => {
      // 1. Update document status
      const { data, error } = await supabase
        .from("documents")
        .update({ status: input.status })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;

      // 2. Create history record
      await supabase.from("document_history").insert({
        document_id: input.id,
        company_id: input.company_id,
        action_type: "status_changed" as HistoryActionType,
        performed_by: input.performed_by,
        comment: `Estado cambiado a: ${input.status}`,
      });

      return data as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.list() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.history(data.id) });
    },
  });
}

// Derive document input
export interface DeriveDocumentInput {
  id: string;
  to_area_id: string;
  to_user_id?: string | null;
  comment?: string;
  company_id: string;
  performed_by: string;
  from_area_id?: string | null;
}

export function useDeriveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeriveDocumentInput) => {
      // 1. Update document assignment
      const { data, error } = await supabase
        .from("documents")
        .update({
          current_area_id: input.to_area_id,
          current_user_id: input.to_user_id || null,
          status: "derived" as DocumentStatus,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;

      // 2. Create history record
      const { error: historyError } = await supabase
        .from("document_history")
        .insert({
          document_id: input.id,
          company_id: input.company_id,
          action_type: "derived" as HistoryActionType,
          performed_by: input.performed_by,
          from_area_id: input.from_area_id || null,
          to_area_id: input.to_area_id,
          to_user_id: input.to_user_id || null,
          comment: input.comment || null,
        });

      if (historyError) {
        console.warn("History creation error:", historyError);
      }

      return data as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.history(data.id) });
    },
  });
}

// Track document view
export function useTrackDocumentView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      companyId,
      performedBy,
    }: {
      documentId: string;
      companyId: string;
      performedBy: string;
    }) => {
      const { error } = await supabase.from("document_history").insert({
        document_id: documentId,
        company_id: companyId,
        action_type: "viewed" as HistoryActionType,
        performed_by: performedBy,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentsKeys.history(variables.documentId),
      });
    },
  });
}

// Track document download
export function useTrackDocumentDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      companyId,
      performedBy,
    }: {
      documentId: string;
      companyId: string;
      performedBy: string;
    }) => {
      const { error } = await supabase.from("document_history").insert({
        document_id: documentId,
        company_id: companyId,
        action_type: "downloaded" as HistoryActionType,
        performed_by: performedBy,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentsKeys.history(variables.documentId),
      });
    },
  });
}

// Get signed URL for document download
export async function getDocumentUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

// Download document
export async function downloadDocument(
  filePath: string,
  fileName: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (error) throw error;

    // Create download link
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Download error:", error);
    return false;
  }
}

// Delete document (admin only)
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([filePath]);

      if (storageError) {
        console.warn("Storage delete error:", storageError);
      }

      // 2. Delete document record (cascades to history)
      const { error } = await supabase.from("documents").delete().eq("id", id);

      if (error) throw error;

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
    },
  });
}
