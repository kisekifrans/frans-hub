"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFinance } from "@/hooks/useFinance";
import {
  categoryTypeLabel,
  normalizeCategoryEmoji,
} from "@/lib/finance/categories";
import type { FinanceCategory, FinanceCategoryType } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const COLORS = [
  "#f97316",
  "#8b5cf6",
  "#22c55e",
  "#f43f5e",
  "#3b82f6",
  "#06b6d4",
  "#ec4899",
  "#71717a",
];

const inputClass =
  "rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm dark:bg-white/5";

export function CategoryManager() {
  const finance = useFinance();
  if (!finance) return null;

  const {
    categories,
    categoryUsageCounts,
    addCategory,
    saveCategory,
    removeCategory,
    moveCategory,
    saving,
  } = finance;

  const [emoji, setEmoji] = useState("📦");
  const [name, setName] = useState("");
  const [type, setType] = useState<FinanceCategoryType>("expense");
  const [color, setColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<FinanceCategory | null>(null);

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  const startEdit = (c: FinanceCategory) => {
    setEditingId(c.id);
    setEditDraft({ ...c });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const submitNew = async () => {
    if (!name.trim()) return;
    await addCategory({
      name: name.trim(),
      icon: normalizeCategoryEmoji(emoji),
      color,
      type,
    });
    setName("");
    setEmoji("📦");
  };

  const submitEdit = async () => {
    if (!editDraft || !editDraft.name.trim()) return;
    await saveCategory({
      ...editDraft,
      icon: normalizeCategoryEmoji(editDraft.icon),
      name: editDraft.name.trim(),
    });
    cancelEdit();
  };

  const tryDelete = async (c: FinanceCategory) => {
    const txUsage = categoryUsageCounts.get(c.id) ?? 0;
    if (txUsage > 0) {
      toast.error(
        `"${c.name}" dipakai di ${txUsage} transaksi. Pindahkan transaksi dulu sebelum hapus.`,
      );
      return;
    }
    if (
      !window.confirm(
        `Hapus kategori "${c.name}"? Budget/langganan yang pakai kategori ini juga dicek di server.`,
      )
    ) {
      return;
    }
    try {
      await removeCategory(c.id);
    } catch {
      /* toast from hook */
    }
  };

  return (
    <GlassCard padding="md" className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Manage categories
        </h2>
        <p className="text-xs text-zinc-500">
          Emoji, nama, tipe. Yang sering dipakai muncul duluan di quick add.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-white/20 bg-white/20 p-3 dark:bg-white/5">
        <p className="text-xs font-medium text-zinc-500">Tambah kategori</p>
        <div className="flex gap-2">
          <input
            className={cn(inputClass, "w-14 text-center text-lg")}
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🍔"
            maxLength={8}
            aria-label="Emoji"
          />
          <input
            className={cn(inputClass, "flex-1")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama (Jajan Malam, Boxing…)"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["expense", "income", "both"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize",
                type === t
                  ? "bg-violet-600 text-white"
                  : "glass-card text-zinc-600",
              )}
            >
              {categoryTypeLabel(t)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition",
                color === c ? "border-white scale-110" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <button
          type="button"
          disabled={saving || !name.trim()}
          onClick={() => void submitNew()}
          className="flex w-full items-center justify-center gap-1 rounded-xl bg-violet-600 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" /> Tambah
            </>
          )}
        </button>
      </div>

      <ul className="max-h-[min(50vh,420px)] space-y-2 overflow-y-auto pr-1">
        {sorted.map((c, index) => {
          const usage = categoryUsageCounts.get(c.id) ?? 0;
          const isEditing = editingId === c.id && editDraft;

          return (
            <li
              key={c.id}
              className="rounded-xl border border-white/20 bg-white/25 p-3 dark:bg-white/5"
            >
              {isEditing && editDraft ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className={cn(inputClass, "w-14 text-center text-lg")}
                      value={editDraft.icon}
                      onChange={(e) =>
                        setEditDraft({
                          ...editDraft,
                          icon: e.target.value,
                        })
                      }
                      maxLength={8}
                    />
                    <input
                      className={cn(inputClass, "flex-1")}
                      value={editDraft.name}
                      onChange={(e) =>
                        setEditDraft({
                          ...editDraft,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <select
                    className={cn(inputClass, "w-full")}
                    value={editDraft.type}
                    onChange={(e) =>
                      setEditDraft({
                        ...editDraft,
                        type: e.target.value as FinanceCategoryType,
                      })
                    }
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="both">Both</option>
                  </select>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() =>
                          setEditDraft({ ...editDraft, color: col })
                        }
                        className={cn(
                          "h-6 w-6 rounded-full border-2",
                          editDraft.color === col
                            ? "border-white"
                            : "border-transparent",
                        )}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="glass-card flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void submitEdit()}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-violet-600 py-2 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: `${c.color}22` }}
                  >
                    {c.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {categoryTypeLabel(c.type)}
                      {usage > 0 ? ` · ${usage}× used` : ""}
                      {c.isDefault ? " · default" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0 || saving}
                      onClick={() => void moveCategory(c.id, "up")}
                      className="rounded p-1.5 text-zinc-400 hover:bg-white/30 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sorted.length - 1 || saving}
                      onClick={() => void moveCategory(c.id, "down")}
                      className="rounded p-1.5 text-zinc-400 hover:bg-white/30 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="rounded p-1.5 text-zinc-400 hover:text-violet-600"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void tryDelete(c)}
                      className="rounded p-1.5 text-zinc-400 hover:text-rose-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
