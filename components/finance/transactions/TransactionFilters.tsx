"use client";

import { Search } from "lucide-react";
import { useFinance } from "@/hooks/useFinance";
import type { FinanceDatePreset, FinanceTransactionType } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const PRESETS: { id: FinanceDatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "period", label: "Salary period" },
  { id: "custom", label: "Custom" },
];

export function TransactionFilters() {
  const finance = useFinance();
  if (!finance) return null;

  const {
    filters,
    setFilters,
    categories,
    paymentMethods,
    currentPeriodId,
  } = finance;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                preset: p.id,
                periodId: p.id === "period" ? currentPeriodId ?? undefined : undefined,
              })
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              filters.preset === p.id
                ? "bg-violet-600 text-white"
                : "glass-card text-zinc-600 dark:text-zinc-300",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "income", "expense"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() =>
              setFilters({ ...filters, type: t as FinanceTransactionType | "all" })
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-xs capitalize",
              (filters.type ?? "all") === t
                ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-500 hover:bg-white/30",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <select
          value={filters.categoryId ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              categoryId: e.target.value || undefined,
            })
          }
          className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <select
          value={filters.paymentMethodId ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              paymentMethodId: e.target.value || undefined,
            })
          }
          className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
        >
          <option value="">All methods</option>
          {paymentMethods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.icon} {m.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            placeholder="Search…"
            value={filters.search ?? ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-white/30 bg-white/40 py-2 pl-9 pr-3 text-sm dark:bg-white/5"
          />
        </div>
      </div>

      {filters.preset === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}
