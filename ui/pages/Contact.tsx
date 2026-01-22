import { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Navbar, Footer } from "@/ui/components/layout";
import { cn } from "@/ui/lib/utils";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Escríbenos para consultas generales",
    value: "soporte@atlas.com",
    href: "mailto:soporte@atlas.com",
  },
  {
    icon: Phone,
    title: "Teléfono",
    description: "Lun - Vie, 9:00 - 18:00",
    value: "+51 932 321 322",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Oficina",
    description: "Visítanos en persona",
    value: "Lima, Perú",
    href: "#",
  },
];

const reasons = [
  { id: "demo", label: "Solicitar demo" },
  { id: "sales", label: "Hablar con ventas" },
  { id: "support", label: "Soporte técnico" },
  { id: "partnership", label: "Alianzas comerciales" },
  { id: "other", label: "Otro" },
];

export default function ContactPage() {
  const [selectedReason, setSelectedReason] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <MessageSquare className="h-4 w-4" />
                Estamos aquí para ayudarte
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                Contáctanos
              </h1>
              <p className="text-xl text-slate-600">
                ¿Tienes preguntas? Nuestro equipo está listo para ayudarte a encontrar la mejor solución.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.title}
                  href={method.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                  className="flex items-start gap-4 p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className="p-3 rounded-xl bg-blue-100">
                    <method.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{method.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{method.description}</p>
                    <p className="text-blue-600 font-medium">{method.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12"
            >
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    ¡Mensaje enviado!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Gracias por contactarnos. Te responderemos dentro de las próximas 24 horas.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Enviar otro mensaje
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      Envíanos un mensaje
                    </h2>
                    <p className="text-slate-600 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Respondemos en menos de 24 horas
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Reason Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        ¿En qué podemos ayudarte?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {reasons.map((reason) => (
                          <button
                            key={reason.id}
                            type="button"
                            onClick={() => setSelectedReason(reason.id)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                              selectedReason === reason.id
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                          Nombre completo
                        </label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Company & Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                          Empresa
                        </label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Nombre de tu empresa"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                          Teléfono (opcional)
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Cuéntanos cómo podemos ayudarte..."
                        required
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Enviar mensaje
                      <Send className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-center text-sm text-slate-500">
                      Al enviar este formulario, aceptas nuestra{" "}
                      <a href="/privacy" className="text-blue-600 hover:underline">
                        política de privacidad
                      </a>
                      .
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
