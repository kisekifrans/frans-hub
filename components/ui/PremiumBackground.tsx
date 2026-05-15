import { cn } from "@/lib/utils";

export type PremiumBgVariant = "violet" | "cyan" | "rose" | "emerald";

interface PremiumBackgroundProps {
  variant?: PremiumBgVariant;
  className?: string;
}

export function PremiumBackground({
  variant = "violet",
  className,
}: PremiumBackgroundProps) {
  return (
    <div
      className={cn("premium-bg", className)}
      data-variant={variant}
      aria-hidden
    >
      <div className="premium-bg__base" />
      <div className="premium-bg__blobs">
        <span className="premium-blob premium-blob--1" />
        <span className="premium-blob premium-blob--2" />
        <span className="premium-blob premium-blob--3" />
        <span className="premium-blob premium-blob--4" />
        <span className="premium-blob premium-blob--5" />
      </div>
      <div className="premium-bg__glow" />
      <div className="premium-bg__vignette" />
      <div className="premium-bg__noise" />
    </div>
  );
}
