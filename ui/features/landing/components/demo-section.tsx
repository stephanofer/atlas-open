import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Upload, 
  Send, 
  History,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/ui/lib/utils";

const demoScreens = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard limpio",
    description: "Vista general de todos tus documentos, métricas y actividad reciente.",
  },
  {
    id: "upload",
    icon: Upload,
    title: "Subir documento",
    description: "Arrastra y suelta archivos, asigna categorías y destinatarios en segundos.",
  },
  {
    id: "forward",
    icon: Send,
    title: "Derivar con un click",
    description: "Envía documentos entre áreas manteniendo la trazabilidad completa.",
  },
  {
    id: "history",
    icon: History,
    title: "Historial completo",
    description: "Timeline detallado de cada acción sobre cada documento.",
  },
];

export function DemoSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % demoScreens.length);
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + demoScreens.length) % demoScreens.length);
  };

  const activeScreen = demoScreens[activeIndex];

  return (
    <section id="demo" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
            Demo
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Mira ATLAS en acción
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Una interfaz intuitiva diseñada para maximizar tu productividad.
          </p>
        </motion.div>

        {/* Demo Carousel */}
        <div className="relative">
          {/* Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-4xl"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
            
            <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-400 text-center border border-slate-600">
                    atlas.com/dashboard
                  </div>
                </div>
                <div className="w-12" /> {/* Spacer for symmetry */}
              </div>

              {/* Screen Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScreen.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-50 p-6 min-h-[400px] sm:min-h-[450px]"
                >
                  {/* Simulated Dashboard Content */}
                  {activeScreen.id === "dashboard" && (
                    <DashboardMockup />
                  )}
                  {activeScreen.id === "upload" && (
                    <UploadMockup />
                  )}
                  {activeScreen.id === "forward" && (
                    <ForwardMockup />
                  )}
                  {activeScreen.id === "history" && (
                    <HistoryMockup />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Indicators */}
            <div className="flex items-center gap-3">
              {demoScreens.map((screen, index) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    activeIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                  )}
                >
                  <screen.icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {screen.title}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Description */}
          <motion.div
            key={activeScreen.id + "-desc"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mt-6"
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeScreen.title}
            </h3>
            <p className="text-slate-400">
              {activeScreen.description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Mockup Components
function DashboardMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600" />
          <div>
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-2 w-24 bg-slate-100 rounded mt-2" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-100 rounded-lg" />
          <div className="h-8 w-8 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: "1,234", color: "bg-blue-500" },
          { label: "Pendientes", value: "23", color: "bg-amber-500" },
          { label: "En proceso", value: "45", color: "bg-cyan-500" },
          { label: "Completados", value: "1,166", color: "bg-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm">
            <div className={`w-2 h-2 ${stat.color} rounded-full mb-2`} />
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600 mb-3">Documentos recientes</div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <div className="w-4 h-5 bg-blue-400 rounded-sm" />
              </div>
              <div className="flex-1">
                <div className="h-2.5 w-40 bg-slate-200 rounded" />
                <div className="h-2 w-24 bg-slate-100 rounded mt-1" />
              </div>
              <div className="h-6 w-16 bg-green-100 rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600 mb-3">Actividad</div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 rounded-full" />
                <div className="flex-1">
                  <div className="h-2 w-full bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadMockup() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="text-lg font-medium text-slate-900 mb-4">Subir documento</div>
        <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50/50">
          <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <div className="text-blue-600 font-medium">Arrastra archivos aquí</div>
          <div className="text-sm text-slate-500 mt-1">o haz click para seleccionar</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600 mb-2">Categoría</div>
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-600 mb-2">Área destino</div>
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-32 bg-blue-600 rounded-lg" />
      </div>
    </div>
  );
}

function ForwardMockup() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <div className="w-6 h-7 bg-blue-400 rounded-sm" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-slate-900">Contrato-2024-001.pdf</div>
          <div className="text-sm text-slate-500">Subido hace 2 horas</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-lg font-medium text-slate-900 mb-4">Derivar a</div>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-600 mb-2">Área destino</div>
            <div className="h-10 bg-slate-100 rounded-lg flex items-center px-4">
              <span className="text-slate-600">Contabilidad</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 mb-2">Usuario</div>
            <div className="h-10 bg-slate-100 rounded-lg flex items-center px-4">
              <span className="text-slate-600">María García</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 mb-2">Comentario</div>
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <div className="h-10 w-32 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium">
            Derivar
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryMockup() {
  const historyItems = [
    { action: "Documento subido", user: "Juan Pérez", time: "Hace 2 días", color: "bg-blue-500" },
    { action: "Derivado a Contabilidad", user: "Juan Pérez", time: "Hace 1 día", color: "bg-cyan-500" },
    { action: "Visualizado", user: "María García", time: "Hace 5 horas", color: "bg-slate-400" },
    { action: "Aprobado", user: "María García", time: "Hace 2 horas", color: "bg-green-500" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <div className="w-6 h-7 bg-green-400 rounded-sm" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-slate-900">Contrato-2024-001.pdf</div>
          <div className="text-sm text-green-600">Aprobado</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-lg font-medium text-slate-900 mb-6">Historial del documento</div>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-6">
            {historyItems.map((item, index) => (
              <div key={index} className="relative flex items-start gap-4 pl-10">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full ${item.color} ring-4 ring-white`} />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{item.action}</div>
                  <div className="text-sm text-slate-500">
                    {item.user} • {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
