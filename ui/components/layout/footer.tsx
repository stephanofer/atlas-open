import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Twitter, 
  Linkedin, 
  Github,
  Mail,
  ArrowRight
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";

const footerLinks = {
  producto: [
    { label: "Características", href: "#caracteristicas" },
    { label: "Precios", href: "/pricing" },
    { label: "Demo", href: "#demo" },
    { label: "Seguridad", href: "#seguridad" },
  ],
  recursos: [
    { label: "Blog", href: "/blog" },
    { label: "Ayuda", href: "/help" },
    { label: "Documentación", href: "/docs" },
    { label: "API", href: "/api-docs" },
  ],
  empresa: [
    { label: "Nosotros", href: "/about" },
    { label: "Contacto", href: "/contact" },
    { label: "Carreras", href: "/careers" },
  ],
  legal: [
    { label: "Términos", href: "/terms" },
    { label: "Privacidad", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/atlas", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/atlas", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/atlas", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/logo.svg"
                alt="ATLAS"
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              La plataforma de gestión documentaria que transforma el caos en orden. 
              Segura, trazable y eficiente.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Suscríbete al newsletter</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                />
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700 shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Recursos</h4>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} ATLAS. Todos los derechos reservados.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
              <a
                href="mailto:hola@atlas.com"
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
