import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/ui/lib/utils";

const testimonials = [
  {
    quote: "Reducimos 70% el tiempo en aprobar facturas. Lo que antes tomaba días, ahora son minutos.",
    author: "Carlos Mendoza",
    role: "Gerente de Finanzas",
    company: "TechCorp",
    avatar: "CM",
    rating: 5,
  },
  {
    quote: "La trazabilidad completa nos salvó en la última auditoría. Todo documentado, todo accesible.",
    author: "María Fernández",
    role: "Directora de Operaciones",
    company: "GlobalFinance",
    avatar: "MF",
    rating: 5,
  },
  {
    quote: "Pasamos de 5 correos para aprobar un documento a cero. ATLAS transformó nuestra operación.",
    author: "Roberto Silva",
    role: "CEO",
    company: "InnovateLabs",
    avatar: "RS",
    rating: 5,
  },
];

export function SocialProofSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
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
            Testimonios
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Empresas que ya confían en ATLAS
          </h2>
        </motion.div>


        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Quote className="h-6 w-6 text-white fill-white" />
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-3xl p-8 sm:p-12 pt-12 border border-slate-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-900 mb-8 leading-relaxed">
                  "{testimonials[activeIndex].quote}"
                </blockquote>

                {/* Author */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold mb-3">
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div className="font-semibold text-slate-900">
                    {testimonials[activeIndex].author}
                  </div>
                  <div className="text-slate-500 text-sm">
                    {testimonials[activeIndex].role} en {testimonials[activeIndex].company}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <button
                onClick={goToPrev}
                className="pointer-events-auto p-2 rounded-full bg-white shadow-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="pointer-events-auto p-2 rounded-full bg-white shadow-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveIndex(index);
                }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  activeIndex === index
                    ? "bg-blue-600 w-8"
                    : "bg-slate-300 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
