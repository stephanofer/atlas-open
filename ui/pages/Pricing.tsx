import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import { Navbar, Footer } from "@/ui/components/layout";
import { cn } from "@/ui/lib/utils";

const plans = [
  {
    name: "Gratis",
    price: "S/0",
    period: "para siempre",
    description: "Perfecto para probar ATLAS y equipos pequeños.",
    features: [
      { text: "5 usuarios", included: true },
      { text: "1 GB de almacenamiento", included: true },
      { text: "100 documentos por mes", included: true },
      { text: "Historial de 30 días", included: true },
      { text: "Soporte por email", included: true },
      { text: "Reportes básicos", included: true },
      { text: "API access", included: false },
      { text: "SSO / SAML", included: false },
    ],
    cta: "Comenzar gratis",
    href: "/register",
    popular: false,
  },
  {
    name: "Pro",
    price: "S/29",
    period: "por usuario / mes",
    description: "Para equipos profesionales que necesitan más poder.",
    features: [
      { text: "Usuarios ilimitados", included: true },
      { text: "50 GB de almacenamiento", included: true },
      { text: "Documentos ilimitados", included: true },
      { text: "Historial completo", included: true },
      { text: "Soporte prioritario", included: true },
      { text: "Reportes avanzados", included: true },
      { text: "API access", included: true },
      { text: "SSO / SAML", included: false },
    ],
    cta: "Probar 14 días gratis",
    href: "/register?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contactar ventas",
    description: "Para organizaciones que requieren personalización total.",
    features: [
      { text: "Todo de Pro, más:", included: true },
      { text: "Almacenamiento ilimitado", included: true },
      { text: "API dedicada", included: true },
      { text: "Soporte 24/7", included: true },
      { text: "SSO / SAML", included: true },
      { text: "SLA garantizado 99.9%", included: true },
      { text: "Gerente de cuenta", included: true },
      { text: "Integraciones custom", included: true },
    ],
    cta: "Contactar ventas",
    href: "/contact",
    popular: false,
  },
];

const faqs = [
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplican inmediatamente.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos todas las tarjetas de crédito principales y transferencias bancarias para planes Enterprise.",
  },
  {
    q: "¿Hay descuentos por pago anual?",
    a: "Sí, ofrecemos 2 meses gratis cuando pagas anualmente (20% de descuento).",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
                Precios simples y transparentes
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                Elige el plan perfecto para tu equipo
              </h1>
              <p className="text-xl text-slate-600">
                Sin costos ocultos. Cancela cuando quieras. Comienza gratis.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className={cn(
                    "relative rounded-2xl p-8 border-2 transition-shadow",
                    plan.popular
                      ? "border-blue-600 shadow-xl shadow-blue-600/10"
                      : "border-slate-200 hover:shadow-lg"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        Más popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold text-slate-900">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">{plan.period}</p>
                    <p className="text-slate-600 mt-4">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <div className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                          feature.included 
                            ? "bg-green-100 text-green-600" 
                            : "bg-slate-100 text-slate-400"
                        )}>
                          {feature.included ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm",
                          feature.included ? "text-slate-700" : "text-slate-400"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={cn(
                      "w-full",
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    )}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    <Link to={plan.href}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Preguntas sobre precios
              </h2>
            </motion.div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl p-6 border border-slate-200"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                      <p className="text-slate-600">{faq.a}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-slate-600 mb-4">
                ¿Necesitas algo diferente?
              </p>
              <Button asChild variant="outline">
                <Link to="/contact">
                  Hablar con ventas
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
