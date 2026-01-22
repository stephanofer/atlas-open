import { motion } from "motion/react";
import { 
  Upload, 
  RefreshCw, 
  History, 
  Users, 
  Lock, 
  BarChart2 
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Sube y comparte",
    description: "Carga documentos en segundos y asígnalos instantáneamente al área o persona correcta.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    hoverBorder: "group-hover:border-blue-300",
  },
  {
    icon: RefreshCw,
    title: "Deriva con control",
    description: "Envía documentos entre áreas con trazabilidad automática. Sin perder el hilo nunca.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    hoverBorder: "group-hover:border-cyan-300",
  },
  {
    icon: History,
    title: "Historial completo",
    description: "Timeline de cada acción sobre cada documento. Quién, cuándo, qué y desde dónde.",
    color: "text-green-600",
    bgColor: "bg-green-100",
    hoverBorder: "group-hover:border-green-300",
  },
  {
    icon: Users,
    title: "Gestión de equipo",
    description: "Crea usuarios, asigna roles y define permisos por área. Control total de accesos.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    hoverBorder: "group-hover:border-purple-300",
  },
  {
    icon: Lock,
    title: "Seguridad garantizada",
    description: "Encriptación de datos, control de accesos por área y cumplimiento normativo.",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    hoverBorder: "group-hover:border-amber-300",
  },
  {
    icon: BarChart2,
    title: "Reportes visuales",
    description: "Métricas de gestión documentaria en tiempo real. Toma decisiones con datos.",
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    hoverBorder: "group-hover:border-rose-300",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

export function FeaturesSection() {
  return (
    <section id="caracteristicas" className="py-24 bg-white relative scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Características
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Todo lo que necesitas para gestionar documentos
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Herramientas poderosas diseñadas para simplificar tu flujo de trabajo 
            y maximizar la productividad de tu equipo.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
              className={`group relative p-8 rounded-2xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ${feature.hoverBorder}`}
            >
              {/* Icon */}
              <motion.div 
                className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <motion.div
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <div className={`w-8 h-8 rounded-full ${feature.bgColor} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${feature.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
