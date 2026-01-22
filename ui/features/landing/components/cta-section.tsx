import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";

const plans = [
  {
    name: "Gratis",
    price: "S/0",
    period: "para siempre",
    description: "Perfecto para empezar",
    features: ["5 usuarios", "1 GB de almacenamiento", "100 documentos/mes", "Soporte por email"],
    cta: "Comenzar gratis",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "S/29",
    period: "/mes",
    description: "Para equipos en crecimiento",
    features: ["25 usuarios", "50 GB de almacenamiento", "Documentos ilimitados", "Soporte prioritario", "Reportes avanzados"],
    cta: "Probar 14 días gratis",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Para grandes organizaciones",
    features: ["Usuarios ilimitados", "Almacenamiento ilimitado", "API dedicada", "Soporte 24/7", "SSO & SAML", "SLA garantizado"],
    cta: "Contactar ventas",
    variant: "outline" as const,
    popular: false,
  },
];

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm mb-6"
          >
            <Sparkles className="h-4 w-4" />
            Sin tarjeta de crédito requerida
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Comienza a organizar tu empresa hoy
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Configuración en 5 minutos • Soporte incluido • Cancela cuando quieras
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -8 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-white shadow-2xl shadow-black/20"
                  : "bg-white/10 backdrop-blur-sm border border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-xs font-semibold text-slate-900">
                    Más popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${plan.popular ? "text-slate-900" : "text-white"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-slate-900" : "text-white"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={plan.popular ? "text-slate-500" : "text-blue-200"}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.popular ? "text-slate-500" : "text-blue-200"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-blue-100 text-blue-600" : "bg-white/20 text-white"
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-sm ${plan.popular ? "text-slate-600" : "text-blue-100"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.popular ? "default" : "outline"}
                className={`w-full ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                <Link to={plan.name === "Enterprise" ? "/contact" : "/register"}>
                  {plan.cta}
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-blue-200 mb-6">
            ¿Tienes preguntas? <Link to="/contact" className="text-white underline hover:no-underline">Habla con nuestro equipo</Link>
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
          >
            <Link to="/register">
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
