import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { cn } from "@/ui/lib/utils";

const navLinks = [
  { href: "#caracteristicas", label: "Características" },
  { href: "#casos-de-uso", label: "Casos de uso" },
  { href: "/pricing", label: "Precios", isPage: true },
  { href: "/contact", label: "Contacto", isPage: true },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, isPage?: boolean) => {
    if (isPage) return;
    
    setIsMobileMenuOpen(false);
    
    // If we're not on the home page, navigate there first
    if (location.pathname !== "/") {
      window.location.href = "/" + href;
      return;
    }
    
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.img
              src="/logo.svg"
              alt="ATLAS"
              className="h-8 w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              link.isPage ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  )}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href, link.isPage)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  )}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25">
              <Link to="/register">Crear cuenta</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                link.isPage ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href, link.isPage)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                  >
                    {link.label}
                  </button>
                )
              ))}
              <div className="pt-4 space-y-2 border-t border-slate-100">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to="/register">Crear cuenta</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
