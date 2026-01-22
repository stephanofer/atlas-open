import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  Package, 
  Calculator, 
  Building2,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/ui/lib/utils";

const useCases = [
  {
    id: "gerentes",
    icon: Briefcase,
    title: "Gerentes",
    shortTitle: "Gerentes",
    headline: "Toma decisiones con información trazable",
    description: "Accede a reportes en tiempo real, visualiza el estado de cada documento y mantén el control total sobre los procesos de tu equipo. Sin sorpresas, sin excusas.",
    benefits: [
      "Dashboard ejecutivo con métricas clave",
      "Alertas de documentos pendientes",
      "Historial completo de aprobaciones",
      "Reportes exportables para auditorías",
    ],
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    id: "logistica",
    icon: Package,
    title: "Logística",
    shortTitle: "Logística",
    headline: "Controla órdenes y facturas sin errores",
    description: "Gestiona órdenes de compra, guías de remisión y facturas en un solo lugar. Trazabilidad completa desde el pedido hasta la entrega.",
    benefits: [
      "Seguimiento de órdenes de compra",
      "Vinculación automática de documentos",
      "Alertas de vencimiento",
      "Integración con proveedores",
    ],
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
  },
  {
    id: "contabilidad",
    icon: Calculator,
    title: "Contabilidad",
    shortTitle: "Contabilidad",
    headline: "Cumplimiento normativo garantizado",
    description: "Mantén todos los documentos contables organizados y listos para auditoría. Historial inmutable que cumple con requisitos regulatorios.",
    benefits: [
      "Organización por periodos fiscales",
      "Búsqueda avanzada por montos y fechas",
      "Retención automática según normativa",
      "Exportación para sistemas contables",
    ],
    color: "bg-green-500",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    id: "administracion",
    icon: Building2,
    title: "Administración",
    shortTitle: "Admin",
    headline: "Centraliza toda la documentación empresarial",
    description: "Contratos, políticas, comunicaciones internas. Todo organizado, accesible y seguro. El centro neurálgico documental de tu empresa.",
    benefits: [
      "Repositorio centralizado",
      "Control de versiones automático",
      "Permisos granulares por área",
      "Búsqueda full-text instantánea",
    ],
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
];

export function UseCasesSection() {
  const [activeTab, setActiveTab] = useState("gerentes");
  const activeCase = useCases.find((uc) => uc.id === activeTab)!;

  return (
    <section id="casos-de-uso" className="py-24 bg-slate-50 relative scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Casos de uso
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Diseñado para equipos que valoran la eficiencia
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Cada área de tu empresa tiene necesidades únicas. ATLAS se adapta a todas.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-lg shadow-slate-200/50 border border-slate-200">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => setActiveTab(useCase.id)}
                className={cn(
                  "relative px-4 sm:px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === useCase.id
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {activeTab === useCase.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn("absolute inset-0 rounded-xl", activeCase.color)}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <useCase.icon className="h-4 w-4 hidden sm:block" />
                  <span className="hidden sm:inline">{useCase.title}</span>
                  <span className="sm:hidden">{useCase.shortTitle}</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Content */}
            <div>
              <div className={cn("inline-flex p-3 rounded-xl mb-6", activeCase.lightColor)}>
                <activeCase.icon className={cn("h-8 w-8", activeCase.textColor)} />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                {activeCase.headline}
              </h3>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {activeCase.description}
              </p>

              <ul className="space-y-4">
                {activeCase.benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={cn("mt-0.5 p-1 rounded-full", activeCase.lightColor)}>
                      <CheckCircle2 className={cn("h-4 w-4", activeCase.textColor)} />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Mockup */}
            <div className="relative">
              <div className={cn(
                "absolute inset-0 rounded-3xl blur-2xl opacity-20",
                activeCase.color
              )} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              >
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded px-3 py-1.5 text-xs text-slate-400 border border-slate-200">
                      atlas.com/{activeCase.id}
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 bg-slate-50 min-h-[300px]">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className={cn(
                      "flex items-center gap-3 bg-white rounded-lg p-4 border-l-4",
                      activeCase.color.replace("bg-", "border-")
                    )}>
                      <activeCase.icon className={cn("h-6 w-6", activeCase.textColor)} />
                      <div>
                        <div className="font-medium text-slate-900">{activeCase.title}</div>
                        <div className="text-sm text-slate-500">Panel de control</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Pendientes", value: "12" },
                        { label: "En proceso", value: "8" },
                        { label: "Completados", value: "156" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-lg p-3 text-center">
                          <div className={cn("text-xl font-bold", activeCase.textColor)}>
                            {stat.value}
                          </div>
                          <div className="text-xs text-slate-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Document List */}
                    <div className="bg-white rounded-lg overflow-hidden">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0"
                        >
                          <div className={cn("w-2 h-2 rounded-full", activeCase.color)} />
                          <div className="flex-1">
                            <div className="h-2 w-32 bg-slate-200 rounded" />
                          </div>
                          <div className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            activeCase.lightColor,
                            activeCase.textColor
                          )}>
                            Nuevo
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
