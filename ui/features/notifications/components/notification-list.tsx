import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { FileText, ArrowRightLeft, CheckCheck, Inbox, Trash2 } from "lucide-react";
import { ScrollArea } from "@/ui/components/shadcn/scroll-area";
import { Button } from "@/ui/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Separator } from "@/ui/components/shadcn/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/shadcn/alert-dialog";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
  useUnreadNotificationCount,
} from "@/ui/hooks/use-notifications";
import type { NotificationWithSender } from "@/ui/hooks/use-notifications";
import { NOTIFICATION_TYPE } from "@/ui/types/database";

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const notificationItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

function NotificationIcon({ type }: { type: string }) {
  if (type === NOTIFICATION_TYPE.DERIVED) {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
        <ArrowRightLeft className="h-3.5 w-3.5" />
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
      <FileText className="h-3.5 w-3.5" />
    </div>
  );
}

interface NotificationItemProps {
  notification: NotificationWithSender;
  onNavigate: (documentId: string) => void;
  index: number;
}

function NotificationItem({
  notification,
  onNavigate,
  index,
}: NotificationItemProps) {
  const markRead = useMarkNotificationRead();

  const handleClick = () => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    onNavigate(notification.document_id);
  };

  return (
    <motion.button
      variants={notificationItemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={handleClick}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Unread dot */}
      <div className="mt-2 flex shrink-0 items-center">
        {!notification.is_read ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-2 w-2 rounded-full bg-primary"
          />
        ) : (
          <div className="h-2 w-2" />
        )}
      </div>

      {/* Icon */}
      <NotificationIcon type={notification.type} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium leading-tight">
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {getTimeAgo(notification.created_at)}
          </span>
        </div>

        {notification.message && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {notification.message}
          </p>
        )}

        {notification.sender && (
          <div className="mt-1 flex items-center gap-1.5">
            <Avatar className="h-4 w-4">
              {notification.sender.avatar_url && (
                <AvatarImage
                  src={notification.sender.avatar_url}
                  alt={notification.sender.full_name}
                />
              )}
              <AvatarFallback className="text-[8px]">
                {getInitials(notification.sender.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-muted-foreground">
              {notification.sender.full_name}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();
  const unreadCount = useUnreadNotificationCount();
  const navigate = useNavigate();
  const hasNotifications = !!notifications?.length;

  const handleNavigate = (documentId: string) => {
    onClose?.();
    navigate(`/dashboard/documents/${documentId}`);
  };

  const handleClearAll = () => {
    clearAll.mutate(undefined, {
      onSuccess: () => setClearDialogOpen(false),
    });
  };

  return (
    <>
      <div className="flex w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 pb-2">
          <h3 className="text-sm font-semibold">Notificaciones</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Leídas
              </Button>
            )}
            {hasNotifications && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setClearDialogOpen(true)}
                disabled={clearAll.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="h-[340px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !notifications?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onNavigate={handleNavigate}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Confirmation dialog for clearing all notifications */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Limpiar todas las notificaciones?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todas tus notificaciones. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearAll.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleClearAll();
              }}
              disabled={clearAll.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearAll.isPending ? "Limpiando..." : "Limpiar todo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
