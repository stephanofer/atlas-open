import { cn } from "@/ui/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * ATLAS Logo component
 * Uses the official logo from public/logo.svg colors
 */
export function Logo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: iconOnly ? "h-6 w-6" : "h-6",
    md: iconOnly ? "h-8 w-8" : "h-8",
    lg: iconOnly ? "h-10 w-10" : "h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  if (iconOnly) {
    return (
      <div className={cn("flex items-center", sizeClasses[size], className)}>
        <svg
          viewBox="0 0 70 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-label="ATLAS Logo"
        >
          <rect y="50" width="70" height="18" rx="9" className="fill-foreground" />
          <rect x="15" y="25" width="60" height="18" rx="9" className="fill-foreground" />
          <rect x="30" width="50" height="18" rx="9" className="fill-primary" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 70 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("flex-shrink-0", sizeClasses[size])}
        aria-label="ATLAS Logo"
      >
        <rect y="50" width="70" height="18" rx="9" className="fill-foreground" />
        <rect x="15" y="25" width="60" height="18" rx="9" className="fill-foreground" />
        <rect x="30" width="50" height="18" rx="9" className="fill-primary" />
      </svg>
      <span className={cn("font-bold tracking-wide", textSizes[size])}>
        ATLAS
      </span>
    </div>
  );
}
