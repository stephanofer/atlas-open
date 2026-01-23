import { Outlet, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/ui/components/shadcn/sidebar";
import { AppSidebar } from "@/ui/components/dashboard/app-sidebar";
import { Separator } from "@/ui/components/shadcn/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/components/shadcn/breadcrumb";

const routeNames: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/documents": "Documentos",
  "/dashboard/upload": "Subir Documento",
  "/dashboard/users": "Usuarios",
  "/dashboard/areas": "Áreas",
  "/dashboard/categories": "Categorías",
  "/dashboard/profile": "Mi Perfil",
  "/dashboard/settings": "Configuración",
};

export function DashboardLayout() {
  const location = useLocation();
  const currentRoute = location.pathname;
  const currentRouteName = routeNames[currentRoute] || "Dashboard";
  const isHomePage = currentRoute === "/dashboard";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {!isHomePage && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentRouteName}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* AnimatePresence with popLayout mode prevents stuck animations on route changes */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
