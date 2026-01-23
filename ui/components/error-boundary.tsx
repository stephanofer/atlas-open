import { Component, type ReactNode } from "react";
import { motion } from "motion/react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { debugAuth } from "@/ui/lib/debug";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    debugAuth.error("React Error Boundary caught error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({ errorInfo });
    
    // Log to console for debugging
    console.error("Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[400px] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Algo salió mal</h2>
              <p className="text-muted-foreground text-sm">
                Ocurrió un error inesperado. Podés intentar recargar la página o
                volver a intentar.
              </p>
            </div>

            {/* Error details for debugging */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left text-xs bg-muted/50 rounded-lg p-4 overflow-auto max-h-[200px]">
                <summary className="cursor-pointer font-medium mb-2">
                  Detalles del error (dev only)
                </summary>
                <pre className="whitespace-pre-wrap text-destructive">
                  {this.state.error.message}
                </pre>
                {this.state.error.stack && (
                  <pre className="whitespace-pre-wrap text-muted-foreground mt-2">
                    {this.state.error.stack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={this.handleReset}>
                Intentar de nuevo
              </Button>
              <Button onClick={this.handleReload}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar página
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Query Error Boundary - specifically for TanStack Query errors
interface QueryErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function QueryErrorFallback({ error, resetError }: QueryErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
      <h3 className="font-semibold mb-2">Error al cargar datos</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || "No se pudieron cargar los datos. Intentá de nuevo."}
      </p>
      <Button variant="outline" size="sm" onClick={resetError}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Reintentar
      </Button>
    </motion.div>
  );
}
