import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Users,
  FolderOpen,
  Tags,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis } from "recharts";

import { useAuthStore } from "@/ui/stores/auth.store";
import { supabase } from "@/ui/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/ui/components/shadcn/chart";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { Badge } from "@/ui/components/shadcn/badge";
import { Button } from "@/ui/components/shadcn/button";
import { Link } from "react-router-dom";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Chart configurations
const documentChartConfig = {
  documents: {
    label: "Documentos",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

const activityChartConfig = {
  uploaded: {
    label: "Subidos",
    color: "var(--color-chart-1)",
  },
  derived: {
    label: "Derivados",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  isLoading?: boolean;
}) {
  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-3xl font-bold">{value}</div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {trend.value}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardHomePage() {
  const profile = useAuthStore((state) => state.profile);
  const greeting = getGreeting();
  const firstName = profile?.full_name?.split(" ")[0] || "Usuario";

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;

      const [documentsRes, usersRes, areasRes, categoriesRes] = await Promise.all([
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("areas").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);

      return {
        documents: documentsRes.count ?? 0,
        users: usersRes.count ?? 0,
        areas: areasRes.count ?? 0,
        categories: categoriesRes.count ?? 0,
      };
    },
    enabled: !!profile?.company_id,
  });

  // Fetch recent documents
  const { data: recentDocs, isLoading: isLoadingDocs } = useQuery({
    queryKey: ["recent-documents", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      const { data } = await supabase
        .from("documents")
        .select("id, title, status, created_at, category:categories(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      return data ?? [];
    },
    enabled: !!profile?.company_id,
  });

  // Fetch monthly document trend data (last 6 months)
  const { data: monthlyTrendData } = useQuery({
    queryKey: ["document-monthly-trend", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const { data } = await supabase
        .from("document_history")
        .select("created_at, action_type")
        .eq("action_type", "uploaded")
        .gte("created_at", sixMonthsAgo.toISOString());

      if (!data) return [];

      // Group by month
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const monthlyData: Record<string, number> = {};
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyData[key] = 0;
      }

      // Count documents per month
      data.forEach((entry) => {
        const date = new Date(entry.created_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (key in monthlyData) {
          monthlyData[key]++;
        }
      });

      // Convert to array format for chart
      return Object.entries(monthlyData).map(([key, count]) => {
        const [, monthIndex] = key.split("-").map(Number);
        return {
          month: months[monthIndex],
          documents: count,
        };
      });
    },
    enabled: !!profile?.company_id,
  });

  // Fetch weekly activity data (last 7 days)
  const { data: weeklyActivityData } = useQuery({
    queryKey: ["document-weekly-activity", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data } = await supabase
        .from("document_history")
        .select("created_at, action_type")
        .in("action_type", ["uploaded", "derived"])
        .gte("created_at", sevenDaysAgo.toISOString());

      if (!data) return [];

      // Group by day
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const dailyData: Record<string, { uploaded: number; derived: number }> = {};

      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split("T")[0];
        dailyData[key] = { uploaded: 0, derived: 0 };
      }

      // Count by action type per day
      data.forEach((entry) => {
        const key = entry.created_at.split("T")[0];
        if (key in dailyData) {
          if (entry.action_type === "uploaded") {
            dailyData[key].uploaded++;
          } else if (entry.action_type === "derived") {
            dailyData[key].derived++;
          }
        }
      });

      // Convert to array format for chart
      return Object.entries(dailyData).map(([dateStr, counts]) => {
        const date = new Date(dateStr);
        return {
          day: days[date.getDay()],
          uploaded: counts.uploaded,
          derived: counts.derived,
        };
      });
    },
    enabled: !!profile?.company_id,
  });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    derived: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    archived: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En progreso",
    completed: "Completado",
    derived: "Derivado",
    archived: "Archivado",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {greeting}, {firstName}
            </h1>
            <motion.div
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-6 w-6 text-amber-500" />
            </motion.div>
          </div>
          <p className="text-muted-foreground">
            Acá tenés un resumen de la actividad en tu empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/dashboard/upload">
              <FileText className="h-4 w-4 mr-2" />
              Subir documento
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documentos"
          value={stats?.documents ?? 0}
          description="En el sistema"
          icon={FileText}
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Usuarios Activos"
          value={stats?.users ?? 0}
          description="En tu empresa"
          icon={Users}
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Áreas"
          value={stats?.areas ?? 0}
          description="Departamentos"
          icon={FolderOpen}
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Categorías"
          value={stats?.categories ?? 0}
          description="Tipos de documento"
          icon={Tags}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Document Trend Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Documentos por Mes</CardTitle>
              <CardDescription>Tendencia de los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-4">
              {monthlyTrendData && monthlyTrendData.length > 0 ? (
                <ChartContainer config={documentChartConfig} className="aspect-[4/3] sm:aspect-[5/2] w-full">
                  <AreaChart
                    data={monthlyTrendData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillDocuments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={4}
                      tick={{ fontSize: 11 }}
                      allowDecimals={false}
                      width={28}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="documents"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fill="url(#fillDocuments)"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="aspect-[4/3] sm:aspect-[2/1] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Sin datos de actividad aún</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actividad Semanal</CardTitle>
              <CardDescription>Documentos subidos y derivados</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-4">
              {weeklyActivityData && weeklyActivityData.length > 0 ? (
                <ChartContainer config={activityChartConfig} className="aspect-[4/3] sm:aspect-[5/2] w-full">
                  <BarChart 
                    data={weeklyActivityData} 
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <XAxis 
                      dataKey="day" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={4}
                      tick={{ fontSize: 11 }}
                      allowDecimals={false}
                      width={28}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="uploaded" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="derived" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="aspect-[4/3] sm:aspect-[2/1] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Sin actividad esta semana</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Documents & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Documents */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Documentos Recientes</CardTitle>
                <CardDescription>Los últimos documentos agregados</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/documents">
                  Ver todos
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingDocs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentDocs && recentDocs.length > 0 ? (
                <div className="space-y-3">
                  {recentDocs.map((doc) => (
                    <motion.div
                      key={doc.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{(doc.category as { name: string })?.name || "Sin categoría"}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{new Date(doc.created_at).toLocaleDateString("es-AR")}</span>
                        </div>
                      </div>
                      <Badge className={statusColors[doc.status] || statusColors.pending} variant="secondary">
                        {statusLabels[doc.status] || doc.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No hay documentos aún</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/dashboard/upload">Subir el primero</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions / Setup Guide */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Primeros Pasos</CardTitle>
              <CardDescription>Configurá tu empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/dashboard/areas"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {stats?.areas ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : "1"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Crear áreas</p>
                  <p className="text-xs text-muted-foreground">Definí los departamentos</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                to="/dashboard/users"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {(stats?.users ?? 0) > 1 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : "2"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Agregar usuarios</p>
                  <p className="text-xs text-muted-foreground">Invitá a tu equipo</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                to="/dashboard/upload"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {stats?.documents ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : "3"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Subir documentos</p>
                  <p className="text-xs text-muted-foreground">Empezá a gestionar</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              {profile?.role === "admin" && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Eres administrador de esta cuenta</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
