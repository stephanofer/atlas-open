import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Play, Shield, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";

const trustIndicators = [
  { icon: Shield, text: "100% Seguro" },
  { icon: Zap, text: "Ahorra 10hrs/semana" },
  { icon: BarChart3, text: "Trazabilidad completa" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge 
                variant="secondary" 
                className="mb-6 px-4 py-1.5 text-sm bg-blue-100 text-blue-700 border-blue-200"
              >
                Nuevo: Dashboard Renovado
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight"
            >
              Gestiona tus documentos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                sin correos ni caos
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0"
            >
              ATLAS centraliza, rastrea y asegura cada documento de tu empresa. 
              Desde recepción hasta archivo, todo en un solo lugar.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button 
                size="lg" 
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all"
              >
                <Link to="/register">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg border-2 hover:bg-slate-50"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Ver demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              {trustIndicators.map((indicator, index) => (
                <motion.div
                  key={indicator.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2 text-slate-600"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    <indicator.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{indicator.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Glow effect behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl scale-95" />
            
            {/* Browser Mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/50 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1.5 text-xs text-slate-400 border border-slate-200">
                    atlas.com/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="p-4 bg-slate-50">
                {/* Mini Dashboard */}
                <div className="space-y-4">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600" />
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                      <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Documentos", value: "1,234", color: "bg-blue-500" },
                      { label: "Pendientes", value: "23", color: "bg-amber-500" },
                      { label: "Completados", value: "1,211", color: "bg-green-500" },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        className="bg-white rounded-lg p-3 shadow-sm"
                        whileHover={{ y: -2 }}
                      >
                        <div className={`w-2 h-2 ${stat.color} rounded-full mb-2`} />
                        <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Document List Preview */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="text-xs font-medium text-slate-600">Documentos recientes</div>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <div className="w-4 h-5 bg-blue-400 rounded-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="h-2.5 w-32 bg-slate-200 rounded mb-1" />
                          <div className="h-2 w-20 bg-slate-100 rounded" />
                        </div>
                        <div className="h-6 w-16 bg-green-100 rounded-full" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-lg p-3 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-900">Documento firmado</div>
                  <div className="text-xs text-slate-500">hace 2 min</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg p-3 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-900">+45% eficiencia</div>
                  <div className="text-xs text-slate-500">este mes</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
