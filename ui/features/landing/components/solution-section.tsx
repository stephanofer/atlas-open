import { motion } from "motion/react";
import { 
  FileUp, 
  Search, 
  CheckCircle2, 
  Archive,
  Target,
  Eye,
  Zap,
  ArrowRight
} from "lucide-react";

const flowSteps = [
  { icon: FileUp, label: "Recepción", color: "bg-blue-500" },
  { icon: Search, label: "Revisión", color: "bg-cyan-500" },
  { icon: CheckCircle2, label: "Aprobación", color: "bg-green-500" },
  { icon: Archive, label: "Archivo", color: "bg-purple-500" },
];

const benefits = [
  {
    icon: Target,
    title: "Centralización total",
    description: "Todo en una plataforma. Sin correos, sin carpetas compartidas, sin caos.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Eye,
    title: "Trazabilidad completa",
    description: "Sabes exactamente quién hizo qué, cuándo y desde dónde. Auditoría perfecta.",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Zap,
    title: "Automatización inteligente",
    description: "Elimina procesos manuales. Los documentos fluyen automáticamente entre áreas.",
    gradient: "from-purple-500 to-purple-600",
  },
];

export function SolutionSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            La solución
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            ATLAS ordena tu flujo documentario{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              de punta a punta
            </span>
          </h2>
        </motion.div>

        {/* Animated Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-0">
            {flowSteps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`relative z-10 flex flex-col items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-2xl ${step.color} text-white shadow-lg`}
                  >
                    <step.icon className="h-8 w-8 lg:h-10 lg:w-10 mb-2" />
                    <span className="text-xs lg:text-sm font-medium">{step.label}</span>
                  </motion.div>
                  
                  {/* Pulse animation */}
                  <motion.div
                    className={`absolute inset-0 ${step.color} rounded-2xl opacity-30`}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                </motion.div>

                {/* Connector Arrow */}
                {index < flowSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.15, duration: 0.3 }}
                    className="hidden lg:flex items-center px-6"
                  >
                    <motion.div
                      className="w-16 h-0.5 bg-gradient-to-r from-slate-300 to-slate-400 relative"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.15, duration: 0.4 }}
                    >
                      <motion.div
                        className="absolute right-0 -top-1.5"
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                      >
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Gradient overlay on hover */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} 
                />
                
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.gradient} mb-5`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Decorative corner */}
                <div 
                  className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${benefit.gradient} opacity-10 rounded-tl-3xl`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
