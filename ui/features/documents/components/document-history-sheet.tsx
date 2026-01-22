import { motion } from "motion/react";
import {
  Upload,
  Eye,
  Download,
  Send,
  RefreshCw,
  Loader2,
  History as HistoryIcon,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/components/shadcn/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { ScrollArea } from "@/ui/components/shadcn/scroll-area";
import { useDocumentHistory, type DocumentHistoryWithRelations } from "@/ui/hooks/use-documents";
import { HISTORY_ACTION_TYPE, type HistoryActionType } from "@/ui/types/database";
import { cn } from "@/ui/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ACTION_CONFIG: Record<
  HistoryActionType,
  { icon: typeof Upload; label: string; color: string }
> = {
  [HISTORY_ACTION_TYPE.UPLOADED]: {
    icon: Upload,
    label: "Subido",
    color: "bg-green-500",
  },
  [HISTORY_ACTION_TYPE.VIEWED]: {
    icon: Eye,
    label: "Visualizado",
    color: "bg-blue-500",
  },
  [HISTORY_ACTION_TYPE.DOWNLOADED]: {
    icon: Download,
    label: "Descargado",
    color: "bg-cyan-500",
  },
  [HISTORY_ACTION_TYPE.DERIVED]: {
    icon: Send,
    label: "Derivado",
    color: "bg-purple-500",
  },
  [HISTORY_ACTION_TYPE.STATUS_CHANGED]: {
    icon: RefreshCw,
    label: "Estado Cambiado",
    color: "bg-orange-500",
  },
};

interface HistoryItemProps {
  item: DocumentHistoryWithRelations;
  isLast: boolean;
}

function HistoryItem({ item, isLast }: HistoryItemProps) {
  const config = ACTION_CONFIG[item.action_type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex gap-4"
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-0 w-[2px] bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm",
          config.color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={item.performed_by_user?.avatar_url || undefined}
              />
              <AvatarFallback className="text-xs">
                {getInitials(item.performed_by_user?.full_name || "U")}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {item.performed_by_user?.full_name || "Usuario"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(item.created_at), "dd MMM, HH:mm", { locale: es })}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{config.label}</span>
        </p>

        {/* Derivation Details */}
        {item.action_type === HISTORY_ACTION_TYPE.DERIVED && (
          <div className="mt-2 text-sm flex items-center gap-2 text-muted-foreground">
            <span>{item.from_area?.name || "Sin área"}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-medium">
              {item.to_area?.name}
            </span>
            {item.to_user && (
              <span className="text-xs">
                ({item.to_user.full_name})
              </span>
            )}
          </div>
        )}

        {/* Comment */}
        {item.comment && (
          <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm text-muted-foreground">
            {item.comment}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface DocumentHistorySheetProps {
  documentId: string | null;
  documentTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentHistorySheet({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: DocumentHistorySheetProps) {
  const { data: history = [], isLoading } = useDocumentHistory(documentId || "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Historial
          </SheetTitle>
          {documentTitle && (
            <SheetDescription className="truncate">
              {documentTitle}
            </SheetDescription>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay historial disponible</p>
            </div>
          ) : (
            <div className="space-y-0">
              {history.map((item, index) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  isLast={index === history.length - 1}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
