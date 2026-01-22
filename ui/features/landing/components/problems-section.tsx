import { motion } from "motion/react";
import { Mail, Clock, AlertTriangle, FileX } from "lucide-react";

const painPoints = [
  {
    icon: Mail,
    title: "Documentos perdidos en correos",
    description: "Hilos interminables donde los archivos importantes desaparecen entre promociones y spam.",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
  },
  {
    icon: Clock,
    title: "Horas buscando versiones",
    description: "¿Cuál era la versión final? ¿V2, V3 o final_final_definitivo.pdf?",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
  },
  {
    icon: AlertTriangle,
    title: "Sin control de aprobaciones",
    description: "Imposible saber quién vio, revisó o aprobó cada documento. Cero trazabilidad.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  {
    icon: FileX,
    title: "Procesos manuales costosos",
    description: "Errores humanos, retrasos y pérdida de tiempo que impactan directamente tu operación.",
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
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
  visible: { opacity: 1, y: 0 },
};

export function ProblemsSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }}
      />

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
            El problema
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            ¿Te suena familiar?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Si tu empresa sigue gestionando documentos por correo, probablemente 
            estés experimentando estos problemas todos los días.
          </p>
        </motion.div>

        {/* Pain Points Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {painPoints.map((point) => (
            <motion.div
              key={point.title}
              variants={cardVariants}
              transition={{ duration: 0.4 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
              className={`group relative p-6 rounded-2xl bg-white border-2 ${point.borderColor} shadow-sm hover:shadow-xl transition-shadow duration-300`}
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${point.bgColor} mb-4`}>
                <point.icon className={`h-6 w-6 ${point.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {point.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {point.description}
              </p>

              {/* Decorative corner */}
              <div 
                className={`absolute top-0 right-0 w-16 h-16 ${point.bgColor} opacity-0 group-hover:opacity-50 rounded-bl-3xl rounded-tr-2xl transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 text-lg">
            El resultado: <span className="font-semibold text-slate-700">pérdida de tiempo, dinero y oportunidades</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
