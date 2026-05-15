import { PremiumBackground, type PremiumBgVariant } from "@/components/ui/PremiumBackground";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  variant?: PremiumBgVariant;
  className?: string;
  contentClassName?: string;
}

export function PageShell({
  children,
  variant = "violet",
  className,
  contentClassName,
}: PageShellProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      <PremiumBackground className="fixed inset-0 -z-10" variant={variant} />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
