"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Trash2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ImportPreviewRow } from "@/lib/finance/import/types";
import { findPeriodForDate } from "@/lib/finance/periods";
import type {
  FinanceBudgetPeriod,
  FinanceCategory,
  FinancePaymentMethod,
} from "@/lib/finance/types";
import { cn } from "@/lib/utils";

interface ImportPreviewModalProps {
  open: boolean;
  filename: string;
  rows: ImportPreviewRow[];
  categories: FinanceCategory[];
  paymentMethods: FinancePaymentMethod[];
  periods?: FinanceBudgetPeriod[];
  errors: string[];
  importing: boolean;
  onClose: () => void;
  onConfirm: (rows: ImportPreviewRow[]) => Promise<void>;
}

export function ImportPreviewModal({
  open,
  filename,
  rows: initialRows,
  categories,
  paymentMethods,
  periods = [],
  errors,
  importing,
  onClose,
  onConfirm,
}: ImportPreviewModalProps) {
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    if (open) setRows(initialRows);
  }, [open, initialRows]);

  if (typeof document === "undefined") return null;

  const expenseCats = categories.filter(
    (c) => c.type === "expense" || c.type === "both",
  );
  const incomeCats = categories.filter(
    (c) => c.type === "income" || c.type === "both",
  );

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
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
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="relative max-h-[90vh] w-full max-w-4xl"
          >
            <GlassCard padding="lg" className="max-h-[90vh] overflow-hidden flex flex-col">
              <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Import preview</h2>
                  <p className="text-xs text-zinc-500">{filename}</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errors.length > 0 ? (
                <ul className="mb-3 shrink-0 space-y-1 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : null}

              <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-white/20">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead className="sticky top-0 bg-white/80 text-xs uppercase text-zinc-500 backdrop-blur dark:bg-zinc-900/90">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Merchant</th>
                      <th className="px-3 py-2">Service</th>
                      <th className="px-3 py-2">Payment</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-white/10 hover:bg-white/20"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="date"
                            className="w-[130px] rounded-lg border border-white/20 bg-white/40 px-2 py-1 text-xs dark:bg-white/5"
                            value={row.transactionDate}
                            onChange={(e) => {
                              const date = e.target.value;
                              const period = findPeriodForDate(periods, date);
                              setRows((list) =>
                                list.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        transactionDate: date,
                                        periodId: period?.id,
                                        periodName: period?.name,
                                      }
                                    : r,
                                ),
                              );
                            }}
                          />
                          {row.periodName ? (
                            <p className="mt-0.5 text-[10px] text-zinc-500">
                              {row.periodName}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className="w-full min-w-[120px] rounded-lg border border-white/20 bg-white/40 px-2 py-1 text-xs dark:bg-white/5"
                            value={row.merchant}
                            onChange={(e) =>
                              setRows((list) =>
                                list.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        merchant: e.target.value,
                                        title: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                          {row.service ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                          {row.paymentMethodName ?? row.paymentMethodLabel ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            className="w-24 rounded-lg border border-white/20 bg-white/40 px-2 py-1 text-xs dark:bg-white/5"
                            value={row.amount}
                            onChange={(e) =>
                              setRows((list) =>
                                list.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        amount: Number(e.target.value) || 0,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                          <span
                            className={cn(
                              "ml-1 text-[10px]",
                              row.type === "income"
                                ? "text-emerald-600"
                                : "text-rose-600",
                            )}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {(() => {
                            const cat =
                              categories.find((c) => c.id === row.categoryId) ??
                              (row.categoryName
                                ? categories.find(
                                    (c) =>
                                      c.name === row.categoryName &&
                                      (c.type === row.type || c.type === "both"),
                                  )
                                : undefined);
                            const badgeColor =
                              cat?.color ?? row.categoryColor ?? "#71717a";
                            const badgeIcon = cat?.icon ?? row.categoryIcon ?? "📁";
                            const badgeName = cat?.name ?? row.categoryName;
                            return (
                              <motion.div className="flex min-w-[140px] flex-col gap-1.5">
                                {badgeName ? (
                                  <span
                                    className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                                    style={{
                                      backgroundColor: `${badgeColor}22`,
                                      color: badgeColor,
                                    }}
                                  >
                                    <span aria-hidden>{badgeIcon}</span>
                                    {badgeName}
                                  </span>
                                ) : null}
                                <select
                                  className="w-full rounded-lg border border-white/20 bg-white/40 px-2 py-1 text-xs dark:bg-white/5"
                                  value={row.categoryId ?? ""}
                                  onChange={(e) => {
                                    const picked = categories.find(
                                      (c) => c.id === e.target.value,
                                    );
                                    setRows((list) =>
                                      list.map((r) =>
                                        r.id === row.id
                                          ? {
                                              ...r,
                                              categoryId: picked?.id,
                                              categoryName: picked?.name,
                                              categoryIcon: picked?.icon,
                                              categoryColor: picked?.color,
                                            }
                                          : r,
                                      ),
                                    );
                                  }}
                                >
                                  <option value="">Change category…</option>
                                  {(row.type === "income"
                                    ? incomeCats
                                    : expenseCats
                                  ).map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.icon} {c.name}
                                    </option>
                                  ))}
                                </select>
                              </motion.div>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              setRows((list) => list.filter((r) => r.id !== row.id))
                            }
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length === 0 ? (
                  <p className="p-8 text-center text-sm text-zinc-500">
                    No rows to import. Close and try another PDF.
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="glass-card flex-1 rounded-xl py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importing || rows.length === 0}
                  onClick={() => void onConfirm(rows)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Confirm import (${rows.length})`
                  )}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
