import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  accent?: "violet" | "cyan" | "rose" | "emerald";
}

const accentStyles = {
  violet: "text-violet-500 bg-violet-500/15",
  cyan: "text-cyan-500 bg-cyan-500/15",
  rose: "text-rose-500 bg-rose-500/15",
  emerald: "text-emerald-500 bg-emerald-500/15",
};

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent = "violet",
}: StatCardProps) {
  return (
    <GlassCard padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accentStyles[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {change && (
          <span className="text-xs font-medium text-emerald-500">{change}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {value}
        </p>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    </GlassCard>
  );
}
