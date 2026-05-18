"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import { formatMoney, toISODate } from "@/lib/finance/format";
import {
  parseIdrInput,
  parseTagsInput,
  tagsToInput,
} from "@/lib/finance/transaction-form";
import type {
  FinanceTransaction,
  FinanceTransactionType,
} from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 dark:bg-white/5 dark:border-white/10";

export type TransactionModalMode = "edit" | "duplicate";

interface TransactionEditModalProps {
  transaction: FinanceTransaction | null;
  mode: TransactionModalMode | null;
  onClose: () => void;
}

export function TransactionEditModal({
  transaction,
  mode,
  onClose,
}: TransactionEditModalProps) {
  const finance = useFinance();

  const [type, setType] = useState<FinanceTransactionType>("expense");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [date, setDate] = useState(toISODate());
  const [tagsRaw, setTagsRaw] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [recurring, setRecurring] = useState(false);

  const open = Boolean(transaction && mode);
  const saving = finance?.saving ?? false;
  const categoriesForType = finance?.categoriesForType;
  const paymentMethods = finance?.paymentMethods ?? [];

  const filteredCategories = useMemo(() => {
    if (categoriesForType) return categoriesForType(type);
    return [];
  }, [categoriesForType, type]);

  useEffect(() => {
    if (!transaction || !mode) return;
    setType(transaction.type);
    setTitle(transaction.title);
    setDescription(transaction.description);
    setAmount(String(Math.round(transaction.amount)));
    setCurrency(transaction.currency || "IDR");
    setCategoryId(transaction.categoryId ?? "");
    setPaymentMethodId(transaction.paymentMethodId ?? "");
    setDate(
      mode === "duplicate" ? toISODate() : transaction.transactionDate,
    );
    setTagsRaw(tagsToInput(transaction.tags));
    setNotes(transaction.notes ?? "");
    setAttachmentUrl(transaction.attachmentUrl ?? "");
    setRecurring(transaction.recurring);
  }, [transaction, mode]);

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
    if (
      categoryId &&
      !filteredCategories.some((c) => c.id === categoryId)
    ) {
      setCategoryId(filteredCategories[0]?.id ?? "");
    }
  }, [open, type, filteredCategories, categoryId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finance || !transaction || !mode) return;

    const parsedAmount = parseIdrInput(amount);
    if (!title.trim() || !parsedAmount) return;

    const payload = {
      type,
      title: title.trim(),
      description: description.trim(),
      amount: parsedAmount,
      currency: currency.trim() || "IDR",
      categoryId: categoryId || undefined,
      paymentMethodId: paymentMethodId || undefined,
      transactionDate: date,
      recurring,
      tags: parseTagsInput(tagsRaw),
      attachmentUrl: attachmentUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (mode === "edit") {
        await finance.saveTransaction({
          ...transaction,
          ...payload,
        });
      } else {
        await finance.addTransaction({
          ...payload,
          periodId: undefined,
        });
      }
      onClose();
    } catch {
      /* toast in hook */
    }
  };

  if (!finance) return null;

  const preview = parseIdrInput(amount);

  return (
    <AnimatePresence>
      {open && transaction && mode ? (
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
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col sm:max-h-[88vh] sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
          >
            <GlassCard
              padding="lg"
              className="flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
            >
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {mode === "edit" ? "Edit transaction" : "Duplicate transaction"}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-zinc-500 hover:bg-white/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => void submit(e)}
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
              >
                <div className="flex gap-2">
                  {(["expense", "income"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "flex-1 rounded-full py-2 text-sm font-medium capitalize",
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
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  required
                />
                <textarea
                  className={cn(inputClass, "min-h-[60px] resize-none")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    inputMode="numeric"
                    className={cn(inputClass, "font-semibold tabular-nums")}
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="Amount"
                    required
                  />
                  <select
                    className={inputClass}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                {preview > 0 && (
                  <p className="text-xs text-zinc-500">
                    Preview: {formatMoney(preview, currency)}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {filteredCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium",
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
                        "rounded-full px-2.5 py-1 text-xs",
                        paymentMethodId === m.id
                          ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                          : "text-zinc-500 hover:bg-white/30",
                      )}
                    >
                      {m.icon} {m.name}
                    </button>
                  ))}
                </div>

                <input
                  type="date"
                  className={inputClass}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                <input
                  className={inputClass}
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="Tags (comma separated)"
                />
                <input
                  className={inputClass}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes"
                />
                <input
                  className={inputClass}
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="Attachment URL (optional)"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                  />
                  Recurring transaction
                </label>

                <div className="sticky bottom-0 flex gap-2 bg-transparent pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="glass-card flex-1 rounded-xl py-2.5 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !title.trim() || !amount}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mode === "edit" ? (
                      "Save"
                    ) : (
                      "Create copy"
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
