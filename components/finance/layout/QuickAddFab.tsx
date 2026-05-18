"use client";

import { Plus } from "lucide-react";
import { QuickAddModal } from "@/components/finance/layout/QuickAddModal";
import { useQuickAdd } from "@/components/finance/layout/QuickAddContext";

export function QuickAddFab() {
  const { open, setOpen } = useQuickAdd();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/40 transition hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
        aria-label="Quick add transaction"
      >
        <Plus className="h-6 w-6" />
      </button>
      <QuickAddModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
