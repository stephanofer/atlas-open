import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import { useAuthStore } from "@/ui/stores/auth.store";
import { debugSupabase, debugQuery } from "@/ui/lib/debug";
import type { Notification, NotificationType } from "@/ui/types/database";

// Extended notification with sender profile info
export interface NotificationWithSender extends Notification {
  sender?: { id: string; full_name: string; avatar_url: string | null } | null;
}

// Query keys
export const notificationsKeys = {
  all: ["notifications"] as const,
  list: (userId?: string) => [...notificationsKeys.all, "list", userId] as const,
  unreadCount: (userId?: string) =>
    [...notificationsKeys.all, "unread-count", userId] as const,
};

// Create notification helper - used by document hooks
export interface CreateNotificationInput {
  company_id: string;
  recipient_id: string;
  document_id: string;
  triggered_by: string;
  type: NotificationType;
  title: string;
  message?: string;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  // Never notify yourself
  if (input.recipient_id === input.triggered_by) return;

  const { error } = await supabase.from("notifications").insert({
    company_id: input.company_id,
    recipient_id: input.recipient_id,
    document_id: input.document_id,
    triggered_by: input.triggered_by,
    type: input.type,
    title: input.title,
    message: input.message ?? null,
  });

  if (error) {
    debugSupabase.warn("Notification creation error (non-blocking)", error);
  } else {
    debugSupabase.success("Notification created", {
      recipient: input.recipient_id,
      type: input.type,
    });
  }
}

// Fetch notifications (last 50, unread first)
export function useNotifications() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  return useQuery({
    queryKey: notificationsKeys.list(userId),
    queryFn: async () => {
      const timer = debugQuery.time("Fetch notifications");
      debugSupabase.log("Fetching notifications", { userId });

      // Fetch notifications ordered: unread first, then by date
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId!)
        .order("is_read", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        timer.end();
        debugSupabase.error("Notifications fetch error", error);
        throw error;
      }

      if (!notifications?.length) {
        timer.end();
        return [];
      }

      // Batch fetch sender profiles
      const senderIds = [
        ...new Set(notifications.map((n) => n.triggered_by)),
      ];

      const { data: senders } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const sendersMap = new Map(
        (senders || []).map((s) => [s.id, s])
      );

      const result: NotificationWithSender[] = notifications.map((n) => ({
        ...n,
        sender: sendersMap.get(n.triggered_by) ?? null,
      }));

      timer.end();
      debugSupabase.success(
        `Fetched ${result.length} notifications (${result.filter((n) => !n.is_read).length} unread)`
      );
      return result;
    },
    enabled: !!userId,
  });
}

// Get unread count (derived from notifications query)
export function useUnreadNotificationCount(): number {
  const { data: notifications } = useNotifications();
  if (!notifications) return 0;
  return notifications.filter((n) => !n.is_read).length;
}

// Mark single notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        debugSupabase.error("Mark notification read error", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.all,
      });
    },
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", profile.id)
        .eq("is_read", false);

      if (error) {
        debugSupabase.error("Mark all notifications read error", error);
        throw error;
      }

      debugSupabase.success("All notifications marked as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.all,
      });
    },
  });
}

// Delete all notifications for current user
export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("recipient_id", profile.id);

      if (error) {
        debugSupabase.error("Clear all notifications error", error);
        throw error;
      }

      debugSupabase.success("All notifications cleared");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.all,
      });
    },
  });
}

// Realtime subscription for new notifications
export function useNotificationRealtime() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = profile?.id;

  useEffect(() => {
    if (!userId) return;

    debugSupabase.log("Setting up notification realtime subscription", {
      userId,
    });

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          debugSupabase.success("New notification received via Realtime", payload.new);

          // Invalidate notifications query to refetch
          queryClient.invalidateQueries({
            queryKey: notificationsKeys.all,
          });
        }
      )
      .subscribe((status) => {
        debugSupabase.log("Notification realtime status", { status });
      });

    return () => {
      debugSupabase.log("Cleaning up notification realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
