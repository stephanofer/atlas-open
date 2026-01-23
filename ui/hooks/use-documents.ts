import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { supabase } from "@/ui/lib/supabase";
import { useAuthStore } from "@/ui/stores/auth.store";
import { debugQuery, debugSupabase } from "@/ui/lib/debug";
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

// Dashboard query keys - to invalidate related queries after document operations
export const dashboardKeys = {
  stats: (companyId?: string, role?: string, areaId?: string | null, userId?: string) => 
    ["dashboard-stats", companyId, role, areaId, userId] as const,
  recentDocuments: (companyId?: string, role?: string, areaId?: string | null, userId?: string) => 
    ["recent-documents", companyId, role, areaId, userId] as const,
  monthlyTrend: (companyId?: string) => ["document-monthly-trend", companyId] as const,
  weeklyActivity: (companyId?: string) => ["document-weekly-activity", companyId] as const,
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
// Filters by user's area if they are not admin/supervisor
export function useDocuments(filters?: DocumentFilters) {
  const { profile } = useAuthStore();
  
  // Use stable primitive values for query key instead of object references
  // This prevents unnecessary refetches when profile object reference changes
  const userId = profile?.id;
  const userRole = profile?.role;
  const userAreaId = profile?.area_id;
  
  return useQuery({
    queryKey: [...documentsKeys.list(filters), userId, userRole, userAreaId],
    queryFn: async () => {
      const timer = debugQuery.time("Fetch documents");
      debugSupabase.log("Fetching documents list", { filters, userId, userRole });

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
      timer.end();

      if (error) {
        debugSupabase.error("Documents fetch error", error);
        throw error;
      }
      
      debugSupabase.success(`Fetched ${data?.length || 0} documents`);
      
      // Filter documents based on user role
      // Admin and Supervisor see all documents in their company
      // Regular users only see documents:
      // - In their area (current_area_id matches their area_id)
      // - Assigned to them (current_user_id matches their id)
      // - Uploaded by them (uploaded_by matches their id)
      if (userRole === "user" && userAreaId) {
        const filtered = (data as DocumentWithRelations[]).filter((doc) => 
          doc.current_area_id === userAreaId ||
          doc.current_user_id === userId ||
          doc.uploaded_by === userId
        );
        debugSupabase.log(`Filtered to ${filtered.length} documents for user role`);
        return filtered;
      }
      
      return data as DocumentWithRelations[];
    },
    enabled: !!profile?.company_id,
  });
}

// Fetch single document with all relations
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: async () => {
      debugSupabase.log("Fetching document detail", { id });
      const timer = debugQuery.time(`Fetch document ${id}`);

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

      timer.end();

      if (error) {
        debugSupabase.error("Document detail fetch error", error);
        throw error;
      }
      
      debugSupabase.success("Document detail fetched", { title: data?.title });
      return data as DocumentWithRelations;
    },
    enabled: !!id,
  });
}

// Fetch document history - OPTIMIZED to avoid N+1 queries
export function useDocumentHistory(documentId: string) {
  return useQuery({
    queryKey: documentsKeys.history(documentId),
    queryFn: async () => {
      debugSupabase.log("Fetching document history", { documentId });
      const timer = debugQuery.time(`Fetch history ${documentId}`);

      // Fetch history records
      const { data: historyData, error: historyError } = await supabase
        .from("document_history")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });

      if (historyError) {
        timer.end();
        debugSupabase.error("History fetch error", historyError);
        throw historyError;
      }

      if (!historyData?.length) {
        timer.end();
        debugSupabase.log("No history records found");
        return [];
      }

      debugSupabase.log(`Found ${historyData.length} history records, fetching relations...`);

      // Collect unique IDs for batch fetching
      const userIds = new Set<string>();
      const areaIds = new Set<string>();

      historyData.forEach((record) => {
        if (record.performed_by) userIds.add(record.performed_by);
        if (record.to_user_id) userIds.add(record.to_user_id);
        if (record.from_area_id) areaIds.add(record.from_area_id);
        if (record.to_area_id) areaIds.add(record.to_area_id);
      });

      debugSupabase.log(`Batch fetching: ${userIds.size} users, ${areaIds.size} areas`);

      // Batch fetch users and areas in parallel
      const [usersResult, areasResult] = await Promise.all([
        userIds.size > 0
          ? supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", Array.from(userIds))
          : { data: [], error: null },
        areaIds.size > 0
          ? supabase
              .from("areas")
              .select("id, name")
              .in("id", Array.from(areaIds))
          : { data: [], error: null },
      ]);

      if (usersResult.error) {
        debugSupabase.warn("Users batch fetch error", usersResult.error);
      }
      if (areasResult.error) {
        debugSupabase.warn("Areas batch fetch error", areasResult.error);
      }

      // Create lookup maps for O(1) access
      const usersMap = new Map(
        (usersResult.data || []).map((u) => [u.id, u])
      );
      const areasMap = new Map(
        (areasResult.data || []).map((a) => [a.id, a])
      );

      // Map history records with relations
      const historyWithRelations: DocumentHistoryWithRelations[] = historyData.map(
        (record) => ({
          ...record,
          performed_by_user: record.performed_by
            ? usersMap.get(record.performed_by) || null
            : null,
          from_area: record.from_area_id
            ? areasMap.get(record.from_area_id) || null
            : null,
          to_area: record.to_area_id
            ? areasMap.get(record.to_area_id) || null
            : null,
          to_user: record.to_user_id
            ? usersMap.get(record.to_user_id) || null
            : null,
        })
      );

      timer.end();
      debugSupabase.success(`History loaded with relations (${historyWithRelations.length} records, 2 batch queries)`);
      
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
      debugSupabase.log("Uploading document", { title: input.title, size: input.file.size });
      const timer = debugQuery.time("Upload document");

      // 1. Upload file to Storage
      const fileExt = input.file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${input.company_id}/documents/${fileName}`;

      debugSupabase.log("Uploading to storage", { filePath });

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, input.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        debugSupabase.error("Storage upload error", uploadError);
        throw new Error("Error al subir el archivo. Intentá de nuevo.");
      }

      debugSupabase.success("File uploaded to storage");

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
        debugSupabase.error("Document record creation error", docError);
        // Try to clean up the uploaded file
        await supabase.storage.from("documents").remove([filePath]);
        throw docError;
      }

      debugSupabase.success("Document record created", { id: document.id });

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
        debugSupabase.warn("History creation error (non-blocking)", historyError);
      }

      timer.end();
      return document as Document;
    },
    onSuccess: () => {
      debugQuery.log("Invalidating all document-related caches after upload");
      // Invalidate ALL queries that start with "documents" - this catches list queries 
      // regardless of filters or user-specific query key parts
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      // Also invalidate dashboard queries that show document counts and recent documents
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-monthly-trend"] });
      queryClient.invalidateQueries({ queryKey: ["document-weekly-activity"] });
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
      debugSupabase.log("Updating document status", { id: input.id, status: input.status });

      // 1. Update document status
      const { data, error } = await supabase
        .from("documents")
        .update({ status: input.status })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        debugSupabase.error("Status update error", error);
        throw error;
      }

      // 2. Create history record
      await supabase.from("document_history").insert({
        document_id: input.id,
        company_id: input.company_id,
        action_type: "status_changed" as HistoryActionType,
        performed_by: input.performed_by,
        comment: `Estado cambiado a: ${input.status}`,
      });

      debugSupabase.success("Status updated", { newStatus: input.status });
      return data as Document;
    },
    onSuccess: (data) => {
      debugQuery.log("Invalidating caches after status update");
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      // Invalidate specific document detail and history
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.history(data.id) });
      // Invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
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
      debugSupabase.log("Deriving document", { id: input.id, toArea: input.to_area_id });

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

      if (error) {
        debugSupabase.error("Derive error", error);
        throw error;
      }

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
        debugSupabase.warn("History creation error (non-blocking)", historyError);
      }

      debugSupabase.success("Document derived");
      return data as Document;
    },
    onSuccess: (data) => {
      debugQuery.log("Invalidating caches after derive");
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      // Invalidate specific document detail and history
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.history(data.id) });
      // Invalidate dashboard queries (recent docs, weekly activity shows derived docs)
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-weekly-activity"] });
    },
  });
}

// Track document view - with deduplication
export function useTrackDocumentView() {
  const queryClient = useQueryClient();
  // Use ref to track already tracked views in this session
  const trackedRef = useRef(new Set<string>());

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
      // Deduplicate view tracking for same document in same session
      const trackingKey = `${documentId}-${performedBy}`;
      if (trackedRef.current.has(trackingKey)) {
        debugSupabase.log("View already tracked in this session, skipping", { documentId });
        return;
      }

      debugSupabase.log("Tracking document view", { documentId });
      
      const { error } = await supabase.from("document_history").insert({
        document_id: documentId,
        company_id: companyId,
        action_type: "viewed" as HistoryActionType,
        performed_by: performedBy,
      });

      if (error) {
        debugSupabase.warn("View tracking error (non-blocking)", error);
        throw error;
      }

      trackedRef.current.add(trackingKey);
      debugSupabase.success("View tracked");
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
      debugSupabase.log("Tracking document download", { documentId });
      
      const { error } = await supabase.from("document_history").insert({
        document_id: documentId,
        company_id: companyId,
        action_type: "downloaded" as HistoryActionType,
        performed_by: performedBy,
      });

      if (error) {
        debugSupabase.warn("Download tracking error (non-blocking)", error);
        throw error;
      }

      debugSupabase.success("Download tracked");
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
  debugSupabase.log("Getting signed URL", { filePath });
  
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    debugSupabase.error("Signed URL error", error);
    return null;
  }

  debugSupabase.success("Signed URL generated");
  return data.signedUrl;
}

// Download document
export async function downloadDocument(
  filePath: string,
  fileName: string
): Promise<boolean> {
  debugSupabase.log("Downloading document", { filePath, fileName });
  
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

    debugSupabase.success("Document downloaded");
    return true;
  } catch (error) {
    debugSupabase.error("Download error", error);
    return false;
  }
}

// Delete document (admin only)
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      debugSupabase.log("Deleting document", { id, filePath });

      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([filePath]);

      if (storageError) {
        debugSupabase.warn("Storage delete error (continuing)", storageError);
      }

      // 2. Delete document record (cascades to history)
      const { error } = await supabase.from("documents").delete().eq("id", id);

      if (error) {
        debugSupabase.error("Document delete error", error);
        throw error;
      }

      debugSupabase.success("Document deleted");
      return id;
    },
    onSuccess: () => {
      debugQuery.log("Invalidating all document-related caches after delete");
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      // Invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-monthly-trend"] });
      queryClient.invalidateQueries({ queryKey: ["document-weekly-activity"] });
    },
  });
}
