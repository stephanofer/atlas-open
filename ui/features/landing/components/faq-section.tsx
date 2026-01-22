import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/components/shadcn/accordion";

const faqs = [
  {
    question: "¿Cómo funciona la prueba gratuita?",
    answer: "Puedes crear una cuenta gratuita sin tarjeta de crédito y usar ATLAS con hasta 5 usuarios y 1 GB de almacenamiento. No hay límite de tiempo para el plan gratuito. Si necesitas más capacidad, puedes actualizar al plan Pro en cualquier momento.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Absolutamente. Utilizamos encriptación AES-256 para todos los documentos, tanto en tránsito como en reposo. Nuestra infraestructura está alojada en centros de datos certificados SOC 2 Type II. Además, realizamos copias de seguridad automáticas cada hora.",
  },
  {
    question: "¿Puedo integrar ATLAS con mi sistema actual?",
    answer: "Sí, ofrecemos una API REST completa que permite integrar ATLAS con cualquier sistema. También tenemos integraciones nativas con herramientas populares como Google Workspace, Microsoft 365 y sistemas ERP. En el plan Enterprise, podemos desarrollar integraciones personalizadas.",
  },
  {
    question: "¿Qué pasa si necesito más almacenamiento?",
    answer: "En el plan Pro, puedes agregar almacenamiento adicional en bloques de 50 GB por un costo mensual reducido. En el plan Enterprise, el almacenamiento es ilimitado y escalable según tus necesidades.",
  },
  {
    question: "¿Cómo funciona el soporte técnico?",
    answer: "El plan gratuito incluye soporte por email con respuesta en 48 horas. El plan Pro ofrece soporte prioritario con respuesta en 4 horas y acceso a chat en vivo. El plan Enterprise incluye soporte 24/7, un gerente de cuenta dedicado y SLA garantizado del 99.9%.",
  },
  {
    question: "¿Puedo migrar mis documentos existentes?",
    answer: "Sí, ofrecemos herramientas de importación masiva para migrar tus documentos desde carpetas locales, Google Drive, Dropbox, SharePoint y otros sistemas. En planes Pro y Enterprise, nuestro equipo puede asistirte en el proceso de migración sin costo adicional.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Todo lo que necesitas saber para empezar con ATLAS.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white rounded-xl border border-slate-200 px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600">
            ¿Tienes más preguntas?{" "}
            <a href="/contact" className="text-blue-600 font-medium hover:underline">
              Contáctanos
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
