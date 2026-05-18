"use client";

import { useState } from "react";
import { MoreVertical, Pencil } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoneyDisplay } from "@/components/finance/shared/MoneyDisplay";
import { TransactionActionsMenu } from "@/components/finance/transactions/TransactionActionsMenu";
import {
  TransactionEditModal,
  type TransactionModalMode,
} from "@/components/finance/transactions/TransactionEditModal";
import { useFinance } from "@/hooks/useFinance";
import { formatShortDate } from "@/lib/finance/format";
import type { FinanceTransaction } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

export function TransactionList({
  items,
  compact,
  showActions = true,
}: {
  items: FinanceTransaction[];
  compact?: boolean;
  showActions?: boolean;
}) {
  const finance = useFinance();
  const categories = finance?.categories ?? [];
  const paymentMethods = finance?.paymentMethods ?? [];
  const removeTransaction = finance?.removeTransaction;

  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    tx: FinanceTransaction;
  } | null>(null);
  const [modalTx, setModalTx] = useState<FinanceTransaction | null>(null);
  const [modalMode, setModalMode] = useState<TransactionModalMode | null>(null);

  const actionsEnabled = showActions && !compact;

  const closeMenu = () => setMenuAnchor(null);

  const openEdit = (t: FinanceTransaction) => {
    closeMenu();
    setModalTx(t);
    setModalMode("edit");
  };

  const openDuplicate = (t: FinanceTransaction) => {
    closeMenu();
    setModalTx(t);
    setModalMode("duplicate");
  };

  const closeModal = () => {
    setModalTx(null);
    setModalMode(null);
  };

  const handleDelete = async (t: FinanceTransaction) => {
    closeMenu();
    if (!window.confirm(`Hapus transaksi "${t.title}"?`)) return;
    if (removeTransaction) await removeTransaction(t.id);
  };

  const toggleMenu = (t: FinanceTransaction, el: HTMLElement) => {
    if (menuAnchor?.tx.id === t.id) {
      closeMenu();
    } else {
      setMenuAnchor({ el, tx: t });
    }
  };

  if (items.length === 0) {
    return (
      <GlassCard padding="md" className="text-center text-sm text-zinc-500">
        No transactions yet.
      </GlassCard>
    );
  }

  return (
    <>
      <ul className="space-y-2 overflow-visible">
        {items.map((t) => {
          const cat = categories.find((c) => c.id === t.categoryId);
          const pm = paymentMethods.find((m) => m.id === t.paymentMethodId);
          const isMenuTarget = menuAnchor?.tx.id === t.id;

          return (
            <li key={t.id} className="overflow-visible">
              <GlassCard
                padding={compact ? "sm" : "md"}
                className="flex items-center gap-2 overflow-visible sm:gap-3"
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
                  <p className="line-clamp-2 text-xs text-zinc-500">
                    {formatShortDate(t.transactionDate)}
                    {pm ? ` · ${pm.icon} ${pm.name}` : ""}
                    {t.description ? ` · ${t.description}` : ""}
                    {t.notes ? ` · ${t.notes}` : ""}
                    {t.recurring ? " · ↻" : ""}
                  </p>
                </div>
                <MoneyDisplay
                  amount={t.amount}
                  type={t.type}
                  signed
                  className={cn(
                    "shrink-0 text-sm font-semibold",
                    compact && "text-xs",
                  )}
                />

                {actionsEnabled && (
                  <button
                    type="button"
                    onClick={(e) => toggleMenu(t, e.currentTarget)}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/40 dark:hover:bg-white/10",
                      isMenuTarget && "bg-white/50 dark:bg-white/10",
                    )}
                    aria-label="Transaction actions"
                    aria-expanded={isMenuTarget}
                    aria-haspopup="menu"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                )}

                {compact && showActions && (
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="shrink-0 rounded-lg p-2 text-zinc-400 hover:text-violet-600"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </GlassCard>
            </li>
          );
        })}
      </ul>

      {menuAnchor ? (
        <TransactionActionsMenu
          open
          anchorEl={menuAnchor.el}
          transaction={menuAnchor.tx}
          onClose={closeMenu}
          onEdit={openEdit}
          onDuplicate={openDuplicate}
          onDelete={(t) => void handleDelete(t)}
        />
      ) : null}

      <TransactionEditModal
        transaction={modalTx}
        mode={modalMode}
        onClose={closeModal}
      />
    </>
  );
}
