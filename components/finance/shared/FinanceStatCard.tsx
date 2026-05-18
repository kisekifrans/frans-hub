import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function FinanceStatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "violet",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: LucideIcon;
  accent?: "violet" | "emerald" | "rose" | "amber";
}) {
  const accentMap = {
    violet: "text-violet-600 dark:text-violet-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
  };

  return (
    <GlassCard padding="md" className="min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        {Icon ? (
          <Icon className={cn("h-4 w-4 shrink-0", accentMap[accent])} />
        ) : null}
      </div>
      <p className={cn("mt-1 text-lg font-bold tabular-nums sm:text-xl", accentMap[accent])}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-zinc-500">{sub}</p> : null}
    </GlassCard>
  );
}
