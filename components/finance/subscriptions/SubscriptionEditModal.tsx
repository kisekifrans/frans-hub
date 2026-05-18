"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { BillingCycle, FinanceSubscription } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 dark:bg-white/5 dark:border-white/10";

interface SubscriptionEditModalProps {
  subscription: FinanceSubscription | null;
  saving: boolean;
  onClose: () => void;
  onSave: (sub: FinanceSubscription) => Promise<void>;
}

export function SubscriptionEditModal({
  subscription,
  saving,
  onClose,
  onSave,
}: SubscriptionEditModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [nextDate, setNextDate] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!subscription) return;
    setName(subscription.name);
    setAmount(String(Math.round(subscription.amount)));
    setCycle(subscription.billingCycle);
    setNextDate(subscription.nextPaymentDate);
    setAutoRenew(subscription.autoRenew);
    setActive(subscription.active);
    setNotes(subscription.notes ?? "");
  }, [subscription]);

  useEffect(() => {
    if (!subscription) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [subscription, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;
    const n = Number(amount.replace(/\D/g, ""));
    if (!name.trim() || !n) return;
    await onSave({
      ...subscription,
      name: name.trim(),
      amount: n,
      billingCycle: cycle,
      nextPaymentDate: nextDate,
      autoRenew,
      active,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {subscription ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="relative w-full max-w-lg sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
          >
            <GlassCard padding="lg" className="rounded-t-2xl sm:rounded-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Edit subscription
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-zinc-500 hover:bg-white/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={(e) => void submit(e)} className="space-y-3">
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    inputMode="numeric"
                    className={inputClass}
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="Amount (IDR)"
                  />
                  <select
                    className={inputClass}
                    value={cycle}
                    onChange={(e) =>
                      setCycle(e.target.value as BillingCycle)
                    }
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <input
                  type="date"
                  className={inputClass}
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
                <textarea
                  className={cn(inputClass, "min-h-[72px] resize-none")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optional)"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                  />
                  Auto-renew
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  Active
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="glass-card flex-1 rounded-xl py-2.5 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !name.trim() || !amount}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
