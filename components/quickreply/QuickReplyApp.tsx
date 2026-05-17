"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Search } from "lucide-react";
import { CategorySidebar } from "@/components/quickreply/CategorySidebar";
import { MessengerPreview } from "@/components/quickreply/MessengerPreview";
import { SnippetCard } from "@/components/quickreply/SnippetCard";
import { SnippetEditor } from "@/components/quickreply/SnippetEditor";
import { PageShell } from "@/components/ui/PageShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useQuickReplies } from "@/hooks/useQuickReplies";

export function QuickReplyApp() {
  const qr = useQuickReplies();

  if (!qr.ready) {
    return (
      <PageShell variant="violet" contentClassName="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Memuat Quick Reply…</p>
      </PageShell>
    );
  }

  const editing = qr.editingId !== null;

  return (
    <PageShell variant="violet" contentClassName="min-h-screen px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="glass-card mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/55 dark:hover:bg-white/15"
              aria-label="Kembali ke admin"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-7 w-7 text-violet-500" />
              <motion.div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                  Quick Reply
                </h1>
                <p className="text-sm font-medium text-violet-600 dark:text-violet-300">
                  Snippet Manager · Facebook Chat
                </p>
              </motion.div>
            </motion.div>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Salin balasan cepat untuk Steam, pembayaran, dan chat Facebook. Data
              tersimpan di perangkat ini (localStorage).
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="mb-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={qr.search}
              onChange={(e) => qr.setSearch(e.target.value)}
              placeholder="Cari judul, kategori, atau isi…"
              className="glass-card w-full rounded-2xl border border-white/25 py-3 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:text-zinc-100"
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          <aside className="lg:col-span-3">
            <CategorySidebar
              categories={qr.categories}
              filter={qr.filter}
              onFilter={qr.setFilter}
              onNewCategory={qr.addCustomCategory}
              onCreate={qr.startCreate}
              recentCount={qr.recentCount}
            />
          </aside>

          <main className="space-y-3 lg:col-span-5">
            {editing ? (
              <SnippetEditor
                draft={qr.draft}
                categories={qr.categories}
                isNew={qr.editingId === "new"}
                onChange={qr.setDraft}
                onSave={() => {
                  const saved = qr.saveDraft();
                  if (saved) void qr.copySnippet(saved);
                  return saved;
                }}
                onCancel={qr.cancelEdit}
              />
            ) : (
              <>
                <p className="text-xs text-zinc-500">
                  {qr.filtered.length} snippet
                  {qr.search.trim() ? ` · pencarian “${qr.search.trim()}”` : ""}
                </p>
                <div className="space-y-3">
                  {qr.filtered.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-violet-300/30 px-4 py-10 text-center text-sm text-zinc-500">
                      Tidak ada snippet. Buat snippet baru atau ubah filter.
                    </p>
                  ) : (
                    qr.filtered.map((snippet) => (
                      <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        selected={qr.selectedId === snippet.id}
                        copyPulse={qr.copyPulseId === snippet.id}
                        onSelect={() => qr.setSelectedId(snippet.id)}
                        onCopy={() => qr.copySnippet(snippet)}
                        onEdit={() => qr.startEdit(snippet)}
                        onToggleFavorite={() => qr.toggleFavorite(snippet.id)}
                        onTogglePin={() => qr.togglePinned(snippet.id)}
                        onDelete={() => {
                          if (
                            window.confirm(
                              `Hapus “${snippet.title}”?`,
                            )
                          ) {
                            qr.deleteSnippet(snippet.id);
                          }
                        }}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </main>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-6">
              <MessengerPreview text={qr.previewText} />
              {qr.selected && !editing ? (
                <button
                  type="button"
                  onClick={() => qr.copySnippet(qr.selected!)}
                  className="mt-3 flex w-full min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 active:scale-[0.98]"
                >
                  Salin pesan terpilih
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
