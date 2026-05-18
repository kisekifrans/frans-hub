"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoneyDisplay } from "@/components/finance/shared/MoneyDisplay";
import { SubscriptionEditModal } from "@/components/finance/subscriptions/SubscriptionEditModal";
import { useFinance } from "@/hooks/useFinance";
import { formatMoney, toISODate } from "@/lib/finance/format";
import { subscriptionMonthlyTotal } from "@/lib/finance/analytics";
import {
  billingCountdownLabel,
  isSubscriptionOverdue,
} from "@/lib/finance/subscription-utils";
import type { BillingCycle, FinanceSubscription } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const inputClass =
  "rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5";

export function SubscriptionsView() {
  const finance = useFinance();
  if (!finance) return null;

  const {
    subscriptions,
    addSubscription,
    saveSubscription,
    removeSubscription,
    saving,
  } = finance;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [nextDate, setNextDate] = useState(toISODate());
  const [editing, setEditing] = useState<FinanceSubscription | null>(null);

  const monthly = subscriptionMonthlyTotal(subscriptions);
  const activeCount = subscriptions.filter((s) => s.active).length;

  const submit = async () => {
    const n = Number(amount.replace(/\D/g, ""));
    if (!name.trim() || !n) return;
    await addSubscription({
      name: name.trim(),
      amount: n,
      currency: "IDR",
      billingCycle: cycle,
      nextPaymentDate: nextDate,
      autoRenew: true,
      active: true,
    });
    setName("");
    setAmount("");
  };

  const toggleActive = async (sub: FinanceSubscription) => {
    await saveSubscription({ ...sub, active: !sub.active });
  };

  const sorted = [...subscriptions].sort((a, b) => {
    const overdueA = isSubscriptionOverdue(a) ? 0 : 1;
    const overdueB = isSubscriptionOverdue(b) ? 0 : 1;
    if (overdueA !== overdueB) return overdueA - overdueB;
    return a.nextPaymentDate.localeCompare(b.nextPaymentDate);
  });

  return (
    <div className="space-y-6">
      <GlassCard padding="md">
        <p className="text-xs text-zinc-500">Estimated monthly total (active)</p>
        <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
          {formatMoney(monthly)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {activeCount} active · {subscriptions.length} total
        </p>
      </GlassCard>

      <GlassCard padding="md" className="space-y-3">
        <h2 className="text-sm font-semibold">Add subscription</h2>
        <input
          placeholder="Name (Spotify, Cursor…)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(inputClass, "w-full")}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            inputMode="numeric"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className={inputClass}
          />
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value as BillingCycle)}
            className={inputClass}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            className={cn(inputClass, "col-span-2 sm:col-span-1")}
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-1"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </GlassCard>

      <ul className="space-y-2">
        {sorted.map((s) => {
          const overdue = isSubscriptionOverdue(s);
          const countdown = billingCountdownLabel(s);
          return (
            <li key={s.id}>
              <GlassCard
                padding="md"
                className={cn(
                  "flex flex-col gap-3 sm:flex-row sm:items-center",
                  overdue && "ring-1 ring-rose-500/40",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "font-medium",
                        !s.active && "text-zinc-400 line-through",
                      )}
                    >
                      {s.name}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        overdue
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : s.active
                            ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                            : "bg-zinc-500/15 text-zinc-500",
                      )}
                    >
                      {countdown}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Next: {s.nextPaymentDate} · {s.billingCycle}
                    {s.autoRenew ? " · auto-renew" : ""}
                    {s.notes ? ` · ${s.notes}` : ""}
                  </p>
                </div>
                <MoneyDisplay
                  amount={s.amount}
                  className="shrink-0 font-semibold sm:mr-1"
                />
                <div className="flex items-center gap-1 sm:shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={s.active}
                    onClick={() => void toggleActive(s)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition",
                      s.active
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "glass-card text-zinc-500",
                    )}
                  >
                    {s.active ? "Active" : "Off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="rounded-lg p-2 text-zinc-400 hover:text-violet-600"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeSubscription(s.id)}
                    className="rounded-lg p-2 text-zinc-400 hover:text-rose-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </GlassCard>
            </li>
          );
        })}
      </ul>

      <SubscriptionEditModal
        subscription={editing}
        saving={saving}
        onClose={() => setEditing(null)}
        onSave={saveSubscription}
      />
    </div>
  );
}
