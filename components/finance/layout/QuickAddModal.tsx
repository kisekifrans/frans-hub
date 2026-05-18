"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import { toISODate } from "@/lib/finance/format";
import type { FinanceTransactionType } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const finance = useFinance();

  const [type, setType] = useState<FinanceTransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(toISODate());

  const paymentMethods = finance?.paymentMethods ?? [];
  const currentPeriodId = finance?.currentPeriodId ?? null;
  const addTransaction = finance?.addTransaction;
  const saving = finance?.saving ?? false;
  const categoriesForType = finance?.categoriesForType;

  const filteredCategories = useMemo(() => {
    if (categoriesForType) return categoriesForType(type);
    return [];
  }, [categoriesForType, type]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const first = filteredCategories[0];
    if (first && !filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(first.id);
    }
  }, [open, filteredCategories, categoryId, type]);

  const reset = () => {
    setTitle("");
    setAmount("");
    setNotes("");
    setDate(toISODate());
    setType("expense");
    const first = finance?.categoriesForType?.("expense")?.[0];
    setCategoryId(first?.id ?? "");
    const pm = paymentMethods[0];
    setPaymentMethodId(pm?.id ?? "");
  };

  useEffect(() => {
    if (open) {
      const pm = paymentMethods[0];
      if (pm && !paymentMethodId) setPaymentMethodId(pm.id);
    }
  }, [open, paymentMethods, paymentMethodId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount.replace(/\D/g, ""));
    if (!title.trim() || !n || n <= 0 || !addTransaction) return;
    await addTransaction({
      type,
      title: title.trim(),
      description: "",
      amount: n,
      currency: "IDR",
      categoryId: categoryId || undefined,
      paymentMethodId: paymentMethodId || undefined,
      transactionDate: date,
      periodId: currentPeriodId ?? undefined,
      recurring: false,
      tags: [],
      notes: notes.trim() || undefined,
    });
    reset();
    onClose();
  };

  if (!finance) return null;

  return (
    <AnimatePresence>
      {open ? (
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
            aria-labelledby="quick-add-title"
          >
            <GlassCard padding="lg" className="rounded-t-2xl sm:rounded-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2
                  id="quick-add-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-white"
                >
                  Quick add
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-zinc-500 hover:bg-white/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={(e) => void submit(e)} className="space-y-4">
                <div className="flex gap-2">
                  {(["expense", "income"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "flex-1 rounded-full py-2 text-sm font-medium capitalize transition",
                        type === t
                          ? t === "income"
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                          : "glass-card text-zinc-600 dark:text-zinc-300",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <input
                  autoFocus
                  placeholder="Title (e.g. Lunch, Spotify)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 dark:bg-white/5 dark:border-white/10"
                />

                <input
                  inputMode="numeric"
                  placeholder="Amount (IDR)"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-lg font-semibold tabular-nums outline-none focus:ring-2 focus:ring-violet-500/40 dark:bg-white/5 dark:border-white/10"
                />

                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {filteredCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition",
                        categoryId === c.id
                          ? "bg-violet-600 text-white"
                          : "glass-card text-zinc-600 dark:text-zinc-300",
                      )}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethodId(m.id)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs transition",
                        paymentMethodId === m.id
                          ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                          : "text-zinc-500 hover:bg-white/30",
                      )}
                    >
                      {m.icon} {m.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-zinc-500">
                    Date
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
                    />
                  </label>
                  <label className="text-xs text-zinc-500">
                    Notes
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional"
                      className="mt-1 w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving || !title.trim() || !amount}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
