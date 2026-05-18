import { GlassCard } from "@/components/ui/GlassCard";
import { MoneyDisplay } from "@/components/finance/shared/MoneyDisplay";
import type { BudgetUsage } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

export function BudgetProgressCard({ usage }: { usage: BudgetUsage }) {
  const barColor =
    usage.status === "over"
      ? "bg-rose-500"
      : usage.status === "warning"
        ? "bg-amber-500"
        : "bg-violet-500";

  return (
    <GlassCard padding="md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span>{usage.icon}</span>
          {usage.categoryName}
        </span>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            usage.status === "over" && "text-rose-600",
            usage.status === "warning" && "text-amber-600",
            usage.status === "ok" && "text-zinc-500",
          )}
        >
          {usage.percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(100, usage.percent)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-zinc-500">
        <span>
          Spent{" "}
          <MoneyDisplay amount={usage.spent} className="inline text-zinc-700 dark:text-zinc-300" />
        </span>
        <span>
          Left{" "}
          <MoneyDisplay
            amount={usage.remaining}
            className={cn(
              "inline font-medium",
              usage.remaining === 0 && "text-rose-600",
            )}
          />
        </span>
      </div>
      <p className="mt-1 text-[10px] text-zinc-400">
        Limit <MoneyDisplay amount={usage.limitAmount} className="inline" />
      </p>
    </GlassCard>
  );
}
