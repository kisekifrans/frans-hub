"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FolderOpen, Plus } from "lucide-react";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { CollectionsListSkeleton } from "@/components/admin/AdminSkeleton";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useCollections } from "@/hooks/useCollections";
import type { Collection } from "@/lib/types";
import { normalizeCollectionSlug } from "@/lib/supabase/collection-mappers";
import { cn } from "@/lib/utils";

export function CollectionsManager() {
  const {
    profileId,
    collections,
    loading,
    saving,
    createCollection,
    saveCollection,
    removeCollection,
    createEmptyProduct,
    createEmptyGalleryImage,
  } = useCollections();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Collection | null>(null);

  const selected = collections.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setDraft({ ...selected });
    else setDraft(null);
  }, [selected]);

  const persistDraft = useCallback(
    async (value: Collection) => {
      await saveCollection(value, true);
    },
    [saveCollection],
  );

  const { status: autoSaveStatus, flush } = useAutoSave(draft, persistDraft, {
    enabled: Boolean(draft),
    delay: 1400,
  });

  const handleCreate = async () => {
    const created = await createCollection();
    if (created) {
      setSelectedId(created.id);
      setDraft(created);
    }
  };

  const handleSaveNow = async () => {
    if (!draft) return;
    await flush();
    await saveCollection(draft, false);
  };

  const handleDelete = async () => {
    if (!draft) return;
    if (!confirm(`Delete collection "${draft.title}"?`)) return;
    await removeCollection(draft.id);
    setSelectedId(null);
    setDraft(null);
  };

  if (loading) {
    return <CollectionsListSkeleton />;
  }

  if (!profileId) {
    return (
      <GlassCard padding="lg">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Connect Supabase to manage collections.
        </p>
      </GlassCard>
    );
  }

  if (draft && selectedId) {
    return (
      <CollectionEditor
        collection={draft}
        profileId={profileId}
        autoSaveStatus={autoSaveStatus}
        saving={saving}
        onChange={setDraft}
        onBack={() => setSelectedId(null)}
        onDelete={handleDelete}
        onSaveNow={handleSaveNow}
        onAddGallery={() => {
          const image = createEmptyGalleryImage(draft.gallery.length);
          setDraft({
            ...draft,
            gallery: [...draft.gallery, image],
          });
        }}
        onAddProduct={() => {
          const product = createEmptyProduct(draft.products.length);
          setDraft({
            ...draft,
            products: [...draft.products, product],
          });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Storefront collections
          </h2>
          <p className="text-sm text-zinc-500">
            Manage collection pages like /tshirtfrans, /boxinggear
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New collection
        </button>
      </div>

      {collections.length === 0 ? (
        <GlassCard padding="lg" className="text-center">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-violet-400" />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            No collections yet. Create your first storefront page.
          </p>
        </GlassCard>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {collections.map((col) => (
            <li key={col.id}>
              <button
                type="button"
                onClick={() => setSelectedId(col.id)}
                className="w-full text-left"
              >
                <GlassCard
                  padding="md"
                  hover
                  className="h-full transition hover:shadow-lg hover:shadow-violet-500/15"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {col.title}
                      </h3>
                      <p className="mt-1 text-xs text-violet-600 dark:text-violet-300">
                        /{normalizeCollectionSlug(col.slug)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        col.enabled
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-zinc-500/15 text-zinc-500",
                      )}
                    >
                      {col.enabled ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                    {col.description || "No description"}
                  </p>
                  <p className="mt-3 text-xs text-zinc-400">
                    {col.products.length} products · {col.gallery.length} gallery
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-600">
                    Edit collection
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </GlassCard>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
