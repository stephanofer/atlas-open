import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/shadcn/popover";
import {
  useUnreadNotificationCount,
  useNotificationRealtime,
} from "@/ui/hooks/use-notifications";
import { NotificationList } from "./notification-list";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadNotificationCount();

  // Subscribe to realtime notifications
  useNotificationRealtime();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
        >
          <Bell className="h-4 w-4" />

          {/* Badge de contador */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] p-2"
        align="end"
        sideOffset={8}
      >
        <NotificationList onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
