"use client";

import { Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoneyDisplay } from "@/components/finance/shared/MoneyDisplay";
import { useFinance } from "@/hooks/useFinance";
import { formatShortDate } from "@/lib/finance/format";
import type { FinanceTransaction } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

export function TransactionList({
  items,
  compact,
  onDelete,
}: {
  items: FinanceTransaction[];
  compact?: boolean;
  onDelete?: boolean;
}) {
  const finance = useFinance();
  const categories = finance?.categories ?? [];
  const paymentMethods = finance?.paymentMethods ?? [];
  const removeTransaction = finance?.removeTransaction;
  const showDelete = onDelete !== false;

  if (items.length === 0) {
    return (
      <GlassCard padding="md" className="text-center text-sm text-zinc-500">
        No transactions yet.
      </GlassCard>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        const pm = paymentMethods.find((m) => m.id === t.paymentMethodId);
        return (
          <li key={t.id}>
            <GlassCard
              padding={compact ? "sm" : "md"}
              className="flex items-center gap-3"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: `${cat?.color ?? "#8b5cf6"}22` }}
              >
                {cat?.icon ?? "📦"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {t.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatShortDate(t.transactionDate)}
                  {pm ? ` · ${pm.icon} ${pm.name}` : ""}
                  {t.notes ? ` · ${t.notes}` : ""}
                </p>
              </div>
              <MoneyDisplay
                amount={t.amount}
                type={t.type}
                signed
                className={cn("shrink-0 text-sm font-semibold")}
              />
              {showDelete && !compact && (
                <button
                  type="button"
                  onClick={() => removeTransaction && void removeTransaction(t.id)}
                  className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </GlassCard>
          </li>
        );
      })}
    </ul>
  );
}
