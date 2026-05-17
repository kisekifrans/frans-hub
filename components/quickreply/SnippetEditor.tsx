"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { MessageComposer } from "@/components/quickreply/MessageComposer";
import { DEFAULT_CATEGORIES } from "@/lib/quickreply/categories";
import type { QuickReply, QuickReplyDraft } from "@/lib/quickreply/types";

interface SnippetEditorProps {
  draft: QuickReplyDraft;
  categories: string[];
  isNew: boolean;
  onChange: (draft: QuickReplyDraft) => void;
  onSave: () => QuickReply | null;
  onCancel: () => void;
}

export function SnippetEditor({
  draft,
  categories,
  isNew,
  onChange,
  onSave,
  onCancel,
}: SnippetEditorProps) {
  const handleSave = () => onSave();

  return (
    <GlassCard padding="lg" className="signature-glow">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        {isNew ? "Snippet Baru" : "Edit Snippet"}
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Pratinjau Messenger diperbarui secara langsung
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Judul
          </span>
          <input
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
            placeholder="Contoh: BCA Payment"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Kategori
          </span>
          <input
            list="qr-categories"
            value={draft.category}
            onChange={(e) => onChange({ ...draft, category: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
          />
          <datalist id="qr-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <MessageComposer
          value={draft.content}
          onChange={(content) => onChange({ ...draft, content })}
          onSave={handleSave}
        />

        <motion.div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={draft.pinned}
              onChange={(e) => onChange({ ...draft, pinned: e.target.checked })}
              className="rounded border-violet-300 text-violet-600"
            />
            <span className="text-zinc-600 dark:text-zinc-400">Sematkan</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={draft.favorite}
              onChange={(e) => onChange({ ...draft, favorite: e.target.checked })}
              className="rounded border-violet-300 text-violet-600"
            />
            <span className="text-zinc-600 dark:text-zinc-400">Favorit</span>
          </label>
        </motion.div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="glass-card rounded-xl px-5 py-2.5 text-sm font-medium"
        >
          Batal
        </button>
      </div>
    </GlassCard>
  );
}
