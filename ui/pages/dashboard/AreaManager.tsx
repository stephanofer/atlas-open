import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  FileText,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Flame,
  Timer,
  ArrowUpRight,
  CircleDot,
  CalendarDays,
  User,
  FolderOpen,
  TrendingUp,
  X,
  Save,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday, addDays } from "date-fns";
import { es } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import { Badge } from "@/ui/components/shadcn/badge";
import { Button } from "@/ui/components/shadcn/button";
import { Progress } from "@/ui/components/shadcn/progress";
import { Avatar, AvatarFallback } from "@/ui/components/shadcn/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/shadcn/dialog";
import { Calendar } from "@/ui/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/shadcn/popover";
import { Textarea } from "@/ui/components/shadcn/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { cn } from "@/ui/lib/utils";

// =====================================================
// MOCK DATA
// =====================================================

const PRIORITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

interface MockDocument {
  id: string;
  title: string;
  category: string;
  status: "pending" | "in_progress" | "derived";
  priority: Priority;
  assignedTo: string;
  assignedToInitials: string;
  uploadedBy: string;
  uploadedByInitials: string;
  createdAt: Date;
  deadline: Date | null;
  area: string;
  daysInArea: number;
  fileType: string;
}

const now = new Date();

const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: "1",
    title: "Factura #2024-0892 - Proveedor TechSupply",
    category: "Factura",
    status: "pending",
    priority: PRIORITY.CRITICAL,
    assignedTo: "María García",
    assignedToInitials: "MG",
    uploadedBy: "Carlos Méndez",
    uploadedByInitials: "CM",
    createdAt: addDays(now, -5),
    deadline: addDays(now, -1), // Vencido
    area: "Contabilidad",
    daysInArea: 5,
    fileType: "application/pdf",
  },
  {
    id: "2",
    title: "Contrato de Servicio - CloudNet Solutions",
    category: "Contrato",
    status: "pending",
    priority: PRIORITY.HIGH,
    assignedTo: "Ana Torres",
    assignedToInitials: "AT",
    uploadedBy: "Roberto Silva",
    uploadedByInitials: "RS",
    createdAt: addDays(now, -3),
    deadline: addDays(now, 1), // Mañana
    area: "Legal",
    daysInArea: 3,
    fileType: "application/pdf",
  },
  {
    id: "3",
    title: "Orden de Compra #OC-4521 - Insumos Oficina",
    category: "Orden de compra",
    status: "in_progress",
    priority: PRIORITY.HIGH,
    assignedTo: "Luis Fernández",
    assignedToInitials: "LF",
    uploadedBy: "Patricia Rojas",
    uploadedByInitials: "PR",
    createdAt: addDays(now, -2),
    deadline: addDays(now, 3),
    area: "Compras",
    daysInArea: 2,
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    id: "4",
    title: "Reporte Mensual de Ventas - Enero 2025",
    category: "Reporte",
    status: "pending",
    priority: PRIORITY.MEDIUM,
    assignedTo: "Sandra López",
    assignedToInitials: "SL",
    uploadedBy: "Diego Martínez",
    uploadedByInitials: "DM",
    createdAt: addDays(now, -1),
    deadline: addDays(now, 5),
    area: "Ventas",
    daysInArea: 1,
    fileType: "application/pdf",
  },
  {
    id: "5",
    title: "Factura #2024-0891 - Servicios Logísticos",
    category: "Factura",
    status: "pending",
    priority: PRIORITY.MEDIUM,
    assignedTo: "María García",
    assignedToInitials: "MG",
    uploadedBy: "José Ramírez",
    uploadedByInitials: "JR",
    createdAt: addDays(now, -4),
    deadline: null, // Sin fecha límite
    area: "Contabilidad",
    daysInArea: 4,
    fileType: "application/pdf",
  },
  {
    id: "6",
    title: "Propuesta Comercial - Expansión Regional",
    category: "Otro",
    status: "in_progress",
    priority: PRIORITY.LOW,
    assignedTo: "Ana Torres",
    assignedToInitials: "AT",
    uploadedBy: "Carlos Méndez",
    uploadedByInitials: "CM",
    createdAt: addDays(now, -7),
    deadline: addDays(now, 10),
    area: "Comercial",
    daysInArea: 7,
    fileType: "application/pdf",
  },
  {
    id: "7",
    title: "Acta de Reunión - Comité Directivo",
    category: "Otro",
    status: "derived",
    priority: PRIORITY.LOW,
    assignedTo: "Luis Fernández",
    assignedToInitials: "LF",
    uploadedBy: "Sandra López",
    uploadedByInitials: "SL",
    createdAt: addDays(now, -6),
    deadline: addDays(now, 2),
    area: "Dirección",
    daysInArea: 6,
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    id: "8",
    title: "Certificado de Calidad - Lote B-2024",
    category: "Otro",
    status: "pending",
    priority: PRIORITY.CRITICAL,
    assignedTo: "Sandra López",
    assignedToInitials: "SL",
    uploadedBy: "Ana Torres",
    uploadedByInitials: "AT",
    createdAt: addDays(now, -2),
    deadline: addDays(now, 0), // Hoy
    area: "Calidad",
    daysInArea: 2,
    fileType: "application/pdf",
  },
];

// =====================================================
// CONFIGS
// =====================================================

const PRIORITY_CONFIG = {
  [PRIORITY.CRITICAL]: {
    label: "Crítico",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    dotColor: "bg-red-500",
    icon: Flame,
  },
  [PRIORITY.HIGH]: {
    label: "Alto",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    dotColor: "bg-orange-500",
    icon: AlertTriangle,
  },
  [PRIORITY.MEDIUM]: {
    label: "Medio",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    dotColor: "bg-yellow-500",
    icon: CircleDot,
  },
  [PRIORITY.LOW]: {
    label: "Bajo",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    dotColor: "bg-green-500",
    icon: CheckCircle2,
  },
} as const;

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  in_progress: { label: "En Proceso", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  derived: { label: "Derivado", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
} as const;

// =====================================================
// ANIMATION VARIANTS
// =====================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { type: "spring" as const, stiffness: 400, damping: 25 } },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getDeadlineStatus(deadline: Date | null): {
  label: string;
  className: string;
  isUrgent: boolean;
} {
  if (!deadline) return { label: "Sin fecha límite", className: "text-muted-foreground", isUrgent: false };
  if (isPast(deadline) && !isToday(deadline)) {
    return { label: `Vencido hace ${formatDistanceToNow(deadline, { locale: es })}`, className: "text-red-600 dark:text-red-400 font-semibold", isUrgent: true };
  }
  if (isToday(deadline)) {
    return { label: "Vence HOY", className: "text-red-600 dark:text-red-400 font-semibold", isUrgent: true };
  }
  const distance = formatDistanceToNow(deadline, { locale: es, addSuffix: false });
  return { label: `Vence en ${distance}`, className: "text-amber-600 dark:text-amber-400", isUrgent: false };
}

// =====================================================
// COMPONENTS
// =====================================================

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accentColor,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  accentColor: string;
}) {
  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={cn("rounded-lg p-2", accentColor)}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge variant="outline" className={cn("gap-1", config.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </Badge>
  );
}

function DocumentRow({
  document,
  onSetDeadline,
}: {
  document: MockDocument;
  onSetDeadline: (doc: MockDocument) => void;
}) {
  const deadlineInfo = getDeadlineStatus(document.deadline);
  const statusConfig = STATUS_CONFIG[document.status];

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Icon + Info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          document.priority === PRIORITY.CRITICAL ? "bg-red-500/10" : "bg-primary/10"
        )}>
          <FileText className={cn(
            "h-5 w-5",
            document.priority === PRIORITY.CRITICAL ? "text-red-500" : "text-primary"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate text-sm">{document.title}</p>
            {deadlineInfo.isUrgent && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">{document.category}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className={cn("text-xs", deadlineInfo.className)}>
              {deadlineInfo.label}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {document.daysInArea}d en el área
            </span>
          </div>
        </div>
      </div>

      {/* Assigned + Tags */}
      <div className="flex items-center gap-2 sm:gap-3 pl-13 sm:pl-0">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
              {document.assignedToInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[100px]">
            {document.assignedTo}
          </span>
        </div>

        <PriorityBadge priority={document.priority} />

        <Badge variant="outline" className={statusConfig.color}>
          {statusConfig.label}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onSetDeadline(document);
          }}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Fecha límite</span>
        </Button>

        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
      </div>
    </motion.div>
  );
}

function DeadlineDialog({
  document,
  open,
  onOpenChange,
  onSave,
}: {
  document: MockDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (docId: string, date: Date | null, priority: Priority, note: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    document?.deadline ?? undefined
  );
  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    document?.priority ?? PRIORITY.MEDIUM
  );
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (document) {
      onSave(document.id, selectedDate ?? null, selectedPriority, note);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Establecer Fecha Límite</DialogTitle>
          <DialogDescription>
            {document?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha límite</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setSelectedDate(undefined)}
              >
                <X className="h-3 w-3 mr-1" />
                Quitar fecha
              </Button>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridad</label>
            <Select value={selectedPriority} onValueChange={(val) => setSelectedPriority(val as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nota (opcional)</label>
            <Textarea
              placeholder="Agregar instrucciones o contexto..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PriorityDistribution({ documents }: { documents: MockDocument[] }) {
  const total = documents.length;
  const counts = {
    [PRIORITY.CRITICAL]: documents.filter((d) => d.priority === PRIORITY.CRITICAL).length,
    [PRIORITY.HIGH]: documents.filter((d) => d.priority === PRIORITY.HIGH).length,
    [PRIORITY.MEDIUM]: documents.filter((d) => d.priority === PRIORITY.MEDIUM).length,
    [PRIORITY.LOW]: documents.filter((d) => d.priority === PRIORITY.LOW).length,
  };

  return (
    <div className="space-y-3">
      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
        const count = counts[key as Priority];
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const Icon = config.icon;

        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-3.5 w-3.5", config.color.split(" ")[1])} />
                <span className="font-medium">{config.label}</span>
              </div>
              <span className="text-muted-foreground tabular-nums">{count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", config.dotColor)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamWorkload({ documents }: { documents: MockDocument[] }) {
  const teamMembers = documents.reduce<Record<string, { name: string; initials: string; count: number; critical: number }>>((acc, doc) => {
    if (!acc[doc.assignedTo]) {
      acc[doc.assignedTo] = { name: doc.assignedTo, initials: doc.assignedToInitials, count: 0, critical: 0 };
    }
    acc[doc.assignedTo].count++;
    if (doc.priority === PRIORITY.CRITICAL || doc.priority === PRIORITY.HIGH) {
      acc[doc.assignedTo].critical++;
    }
    return acc;
  }, {});

  const sorted = Object.values(teamMembers).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3">
      {sorted.map((member) => (
        <motion.div
          key={member.name}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground">
              {member.count} doc{member.count !== 1 ? "s" : ""}
              {member.critical > 0 && (
                <span className="text-red-500 ml-1">· {member.critical} urgente{member.critical !== 1 ? "s" : ""}</span>
              )}
            </p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: member.count }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i < member.critical ? "bg-red-500" : "bg-primary/40"
                )}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function AreaManagerPage() {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  // Computed stats
  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const overdueCount = documents.filter((d) => d.deadline && isPast(d.deadline) && !isToday(d.deadline)).length;
  const dueTodayCount = documents.filter((d) => d.deadline && isToday(d.deadline)).length;
  const criticalCount = documents.filter((d) => d.priority === PRIORITY.CRITICAL || d.priority === PRIORITY.HIGH).length;
  const avgDaysInArea = Math.round(documents.reduce((sum, d) => sum + d.daysInArea, 0) / documents.length);

  // Filtered docs
  const filteredDocs = filterPriority === "all"
    ? documents
    : documents.filter((d) => d.priority === filterPriority);

  // Sort: overdue first, then by priority, then by deadline
  const priorityOrder = { [PRIORITY.CRITICAL]: 0, [PRIORITY.HIGH]: 1, [PRIORITY.MEDIUM]: 2, [PRIORITY.LOW]: 3 };
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    // Overdue first
    const aOverdue = a.deadline && isPast(a.deadline) ? 0 : 1;
    const bOverdue = b.deadline && isPast(b.deadline) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    // Then by priority
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Then by deadline (soonest first)
    if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });

  const handleSetDeadline = (doc: MockDocument) => {
    setSelectedDoc(doc);
    setDialogOpen(true);
  };

  const handleSaveDeadline = (docId: string, date: Date | null, priority: Priority, _note: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, deadline: date, priority } : d
      )
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Panel de Área
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Jefe de Área
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Priorizá y gestioná los documentos pendientes de tu equipo
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última actualización: {format(now, "HH:mm", { locale: es })} hs</span>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Pendientes"
          value={pendingCount}
          description="Documentos por atender"
          icon={Clock}
          accentColor="bg-yellow-500/10 text-yellow-600"
        />
        <MetricCard
          title="Vencidos"
          value={overdueCount}
          description="Pasaron la fecha límite"
          icon={AlertTriangle}
          accentColor="bg-red-500/10 text-red-600"
        />
        <MetricCard
          title="Vencen Hoy"
          value={dueTodayCount}
          description="Requieren atención inmediata"
          icon={Flame}
          accentColor="bg-orange-500/10 text-orange-600"
        />
        <MetricCard
          title="Alta Prioridad"
          value={criticalCount}
          description="Críticos y altos"
          icon={TrendingUp}
          accentColor="bg-purple-500/10 text-purple-600"
        />
        <MetricCard
          title="Promedio en Área"
          value={`${avgDaysInArea}d`}
          description="Tiempo promedio"
          icon={Timer}
          accentColor="bg-blue-500/10 text-blue-600"
        />
      </div>

      {/* Urgency Bar */}
      <AnimatePresence>
        {(overdueCount > 0 || dueTodayCount > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="flex items-center gap-3 py-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    ¡Atención! Hay {overdueCount + dueTodayCount} documento{(overdueCount + dueTodayCount) !== 1 ? "s" : ""} que requieren acción inmediata
                  </p>
                  <p className="text-xs text-red-500/80 mt-0.5">
                    {overdueCount > 0 && `${overdueCount} vencido${overdueCount !== 1 ? "s" : ""}`}
                    {overdueCount > 0 && dueTodayCount > 0 && " · "}
                    {dueTodayCount > 0 && `${dueTodayCount} vence${dueTodayCount !== 1 ? "n" : ""} hoy`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-600 hover:bg-red-500/10"
                  onClick={() => setFilterPriority(PRIORITY.CRITICAL)}
                >
                  Ver críticos
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Documentos del Área</CardTitle>
                  <CardDescription>
                    {sortedDocs.length} documento{sortedDocs.length !== 1 ? "s" : ""} · Ordenados por urgencia
                  </CardDescription>
                </div>
              </div>

              {/* Priority Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-px">
                <button
                  type="button"
                  onClick={() => setFilterPriority("all")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                    filterPriority === "all"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  Todos ({documents.length})
                </button>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                  const count = documents.filter((d) => d.priority === key).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilterPriority(key as Priority)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                        filterPriority === key
                          ? cn("shadow-sm", config.color)
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
                      {config.label} ({count})
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DocumentRow document={doc} onSetDeadline={handleSetDeadline} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {sortedDocs.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No hay documentos con esta prioridad</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => setFilterPriority("all")}
                  >
                    Ver todos los documentos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Panels */}
        <div className="space-y-4">
          {/* Priority Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Distribución de Prioridad</CardTitle>
                <CardDescription>Estado actual del área</CardDescription>
              </CardHeader>
              <CardContent>
                <PriorityDistribution documents={documents} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Workload */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Carga del Equipo
                </CardTitle>
                <CardDescription>Documentos asignados por persona</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamWorkload documents={documents} />
              </CardContent>
            </Card>
          </motion.div>

          {/* SLA Compliance */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cumplimiento SLA</CardTitle>
                <CardDescription>Documentos dentro de plazo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const withDeadline = documents.filter((d) => d.deadline);
                  const onTime = withDeadline.filter((d) => d.deadline && !isPast(d.deadline)).length;
                  const percentage = withDeadline.length > 0 ? Math.round((onTime / withDeadline.length) * 100) : 100;

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{percentage}%</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            percentage >= 80
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : percentage >= 50
                                ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                          )}
                        >
                          {percentage >= 80 ? "Bueno" : percentage >= 50 ? "Regular" : "Crítico"}
                        </Badge>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{onTime} en plazo</span>
                        <span>{withDeadline.length - onTime} fuera de plazo</span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Deadline Dialog */}
      <DeadlineDialog
        document={selectedDoc}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveDeadline}
      />
    </motion.div>
  );
}
