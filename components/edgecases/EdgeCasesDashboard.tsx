"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Loader2, Plus } from "lucide-react";
import { EdgeCaseCard } from "@/components/edgecases/EdgeCaseCard";
import { EdgeCaseFiltersBar } from "@/components/edgecases/EdgeCaseFiltersBar";
import { EdgeCaseFormModal } from "@/components/edgecases/EdgeCaseFormModal";
import { EdgeCaseVideoModal } from "@/components/edgecases/EdgeCaseVideoModal";
import { PageShell } from "@/components/ui/PageShell";
import { useEdgeCases } from "@/hooks/useEdgeCases";
import type { EdgeCase, EdgeCaseInput } from "@/lib/edgecases/types";

export function EdgeCasesDashboard() {
  const {
    filteredItems,
    projects,
    loading,
    saving,
    filters,
    setFilters,
    addCase,
    saveCase,
    removeCase,
    duplicateCase,
    toggleFavorite,
  } = useEdgeCases();

  const [playItem, setPlayItem] = useState<EdgeCase | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editItem, setEditItem] = useState<EdgeCase | null>(null);

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditItem(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((item: EdgeCase) => {
    setFormMode("edit");
    setEditItem(item);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (
      input: EdgeCaseInput,
      existing?: EdgeCase,
      createId?: string,
    ) => {
      if (existing) {
        await saveCase({ ...existing, ...input, isFavorite: existing.isFavorite });
      } else {
        await addCase(input, createId);
      }
    },
    [addCase, saveCase],
  );

  if (loading) {
    return (
      <PageShell contentClassName="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </PageShell>
    );
  }

  return (
    <PageShell contentClassName="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="glass-card rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-white/55 dark:text-zinc-300 dark:hover:bg-white/15"
            >
              ← Admin
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                Edge Cases
              </h1>
              <p className="text-xs text-zinc-500">
                Self-hosted library · {filteredItems.length} shown
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25"
          >
            <Plus className="h-4 w-4" /> Add edge case
          </button>
        </header>

        <EdgeCaseFiltersBar
          filters={filters}
          projects={projects}
          onChange={setFilters}
        />

        {filteredItems.length === 0 ? (
          <p className="mt-8 text-center text-sm text-zinc-500">
            No edge cases match your filters.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <EdgeCaseCard
                key={item.id}
                item={item}
                onPlay={setPlayItem}
                onEdit={openEdit}
                onDuplicate={(t) => void duplicateCase(t)}
                onDelete={(id) => void removeCase(id)}
                onToggleFavorite={(t) => void toggleFavorite(t)}
              />
            ))}
          </div>
        )}
      </div>

      <EdgeCaseVideoModal item={playItem} onClose={() => setPlayItem(null)} />

      <EdgeCaseFormModal
        open={formOpen}
        mode={formMode}
        initial={editItem}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </PageShell>
  );
}
