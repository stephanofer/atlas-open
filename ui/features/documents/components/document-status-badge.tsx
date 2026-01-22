import { Badge } from "@/ui/components/shadcn/badge";
import { DOCUMENT_STATUS, type DocumentStatus } from "@/ui/types/database";
import { cn } from "@/ui/lib/utils";

const STATUS_CONFIG = {
  [DOCUMENT_STATUS.PENDING]: {
    label: "Pendiente",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20",
  },
  [DOCUMENT_STATUS.IN_PROGRESS]: {
    label: "En Proceso",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  },
  [DOCUMENT_STATUS.DERIVED]: {
    label: "Derivado",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
  },
  [DOCUMENT_STATUS.COMPLETED]: {
    label: "Completado",
    className: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  },
  [DOCUMENT_STATUS.ARCHIVED]: {
    label: "Archivado",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20",
  },
} as const;

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: DocumentStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}
