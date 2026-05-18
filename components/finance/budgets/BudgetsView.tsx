"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BudgetProgressCard } from "@/components/finance/budget/BudgetProgressCard";
import { PeriodSelector } from "@/components/finance/shared/PeriodSelector";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import { findBudgetLimitForCategory } from "@/lib/finance/dedupe";

function parseIdrInput(value: string): number {
  const n = Number(value.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function BudgetsView() {
  const finance = useFinance();
  if (!finance) return null;

  const {
    budgetUsage,
    currentPeriodId,
    currentPeriod,
    limits,
    saveBudgetLimit,
    savePeriodSalary,
    saving,
  } = finance;

  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [salary, setSalary] = useState("");

  useEffect(() => {
    const v = currentPeriod?.salaryReceived;
    setSalary(v != null && v > 0 ? String(Math.round(v)) : "");
  }, [currentPeriod?.id, currentPeriod?.salaryReceived]);

  useEffect(() => {
    if (!currentPeriodId || !categoryId) return;
    const existing = findBudgetLimitForCategory(
      limits,
      currentPeriodId,
      categoryId,
    );
    if (!existing) return;
    const row = limits.find((l) => l.id === existing.id);
    if (row) {
      setLimit(String(Math.round(row.limitAmount)));
      setThreshold(String(Math.round(row.warningThreshold)));
    }
  }, [categoryId, currentPeriodId, limits]);

  const expenseCats = finance.categoriesForType("expense");

  const addLimit = async () => {
    if (!currentPeriodId) {
      toast.error("Pilih periode gaji dulu");
      return;
    }
    if (!categoryId) {
      toast.error("Pilih kategori");
      return;
    }
    const limitAmount = parseIdrInput(limit);
    if (!limitAmount) {
      toast.error("Masukkan nominal limit");
      return;
    }
    const warningThreshold = Number(threshold) || 80;
    if (warningThreshold <= 0 || warningThreshold > 100) {
      toast.error("Threshold harus 1–100%");
      return;
    }

    const existing = findBudgetLimitForCategory(
      limits,
      currentPeriodId,
      categoryId,
    );

    try {
      await saveBudgetLimit({
        id: existing?.id,
        categoryId,
        periodId: currentPeriodId,
        limitAmount,
        warningThreshold,
      });
      setLimit("");
    } catch {
      /* toast handled in hook */
    }
  };

  const saveSalary = async () => {
    if (!currentPeriodId) {
      toast.error("Pilih periode gaji dulu");
      return;
    }
    const n = salary.replace(/\D/g, "");
    try {
      await savePeriodSalary(
        currentPeriodId,
        n ? Number(n) : null,
      );
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <div className="space-y-6">
      <PeriodSelector />

      <GlassCard padding="md" className="space-y-3">
        <h2 className="text-sm font-semibold">Salary received this period</h2>
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            placeholder="IDR amount"
            value={salary}
            onChange={(e) => setSalary(e.target.value.replace(/[^\d]/g, ""))}
            className="flex-1 rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
          />
          <button
            type="button"
            disabled={saving || !currentPeriodId}
            onClick={() => void saveSalary()}
            className="flex min-w-[5rem] items-center justify-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        </div>
      </GlassCard>

      <GlassCard padding="md" className="space-y-3">
        <h2 className="text-sm font-semibold">Add / update budget limit</h2>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
        >
          <option value="">Category</option>
          {expenseCats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            placeholder="Limit (IDR)"
            value={limit}
            onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))}
            className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm"
          />
          <input
            inputMode="numeric"
            placeholder="Warn at %"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value.replace(/[^\d]/g, ""))}
            className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={saving || !currentPeriodId}
          onClick={() => void addLimit()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save limit"}
        </button>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2">
        {budgetUsage.map((u) => (
          <BudgetProgressCard key={u.categoryId} usage={u} />
        ))}
      </div>
      {budgetUsage.length === 0 && (
        <p className="text-center text-sm text-zinc-500">
          No limits set for this period.
        </p>
      )}
    </div>
  );
}
