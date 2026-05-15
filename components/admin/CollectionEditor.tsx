"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { AdminField, AdminTextarea } from "@/components/admin/AdminField";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Collection } from "@/lib/types";
import { normalizeCollectionSlug } from "@/lib/supabase/collection-mappers";
import type { AutoSaveStatus } from "@/hooks/useAutoSave";
import { cn } from "@/lib/utils";

interface CollectionEditorProps {
  collection: Collection;
  profileId: string;
  autoSaveStatus: AutoSaveStatus;
  saving: boolean;
  onChange: (collection: Collection) => void;
  onBack: () => void;
  onDelete: () => void;
  onSaveNow: () => void;
  onAddGallery: () => void;
  onAddProduct: () => void;
}

function SaveStatusBadge({ status }: { status: AutoSaveStatus }) {
  const label =
    status === "pending"
      ? "Unsaved changes…"
      : status === "saving"
        ? "Saving draft…"
        : status === "saved"
          ? "Draft saved"
          : status === "error"
            ? "Save failed"
            : null;
  if (!label) return null;
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        status === "error"
          ? "bg-rose-500/15 text-rose-600"
          : status === "saved"
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-violet-500/15 text-violet-700 dark:text-violet-300",
      )}
    >
      {label}
    </span>
  );
}

export function CollectionEditor({
  collection,
  profileId,
  autoSaveStatus,
  saving,
  onChange,
  onBack,
  onDelete,
  onSaveNow,
  onAddGallery,
  onAddProduct,
}: CollectionEditorProps) {
  const patch = (p: Partial<Collection>) => onChange({ ...collection, ...p });
  const slugPreview = normalizeCollectionSlug(collection.slug) || "your-slug";
  const heroPreview = collection.heroGifUrl ?? collection.heroImageUrl;
  const heroPath =
    collection.heroGifStoragePath ?? collection.heroImageStoragePath;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All collections
          </button>
          <SaveStatusBadge status={autoSaveStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${slugPreview}`}
            target="_blank"
            className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview
          </Link>
          <button
            type="button"
            onClick={onSaveNow}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            Save now
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <GlassCard padding="lg" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Collection
          </h2>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={collection.enabled}
              onChange={(e) => patch({ enabled: e.target.checked })}
            />
            Published
          </label>
        </div>
        <AdminField
          label="Title"
          value={collection.title}
          onChange={(title) => patch({ title })}
        />
        <AdminField
          label="URL slug"
          value={collection.slug}
          onChange={(slug) => patch({ slug })}
          hint={`/${slugPreview}`}
        />
        <AdminTextarea
          label="Short tagline (optional)"
          value={collection.description}
          onChange={(description) => patch({ description })}
          rows={2}
        />
        <MediaUpload
          profileId={profileId}
          blockId={`${collection.id}/hero`}
          folder="collections"
          label="Hero preview (image or GIF)"
          accept="image/*,.gif"
          previewAspect="video"
          maxSizeMb={12}
          currentUrl={heroPreview}
          storagePath={heroPath}
          onUploaded={(url, storagePath) => {
            if (/\.gif(\?|$)/i.test(url)) {
              patch({
                heroGifUrl: url,
                heroGifStoragePath: storagePath,
                heroImageUrl: undefined,
                heroImageStoragePath: undefined,
              });
            } else {
              patch({
                heroImageUrl: url,
                heroImageStoragePath: storagePath,
                heroGifUrl: undefined,
                heroGifStoragePath: undefined,
              });
            }
          }}
          onClear={() =>
            patch({
              heroGifUrl: undefined,
              heroGifStoragePath: undefined,
              heroImageUrl: undefined,
              heroImageStoragePath: undefined,
            })
          }
        />
      </GlassCard>

      <GlassCard padding="lg">
        <ProductsManager
          profileId={profileId}
          collectionId={collection.id}
          products={collection.products}
          onChange={(products) => patch({ products })}
          onAdd={onAddProduct}
        />
      </GlassCard>

      <GlassCard padding="lg">
        <GalleryManager
          profileId={profileId}
          collectionId={collection.id}
          images={collection.gallery}
          onChange={(gallery) => patch({ gallery })}
          onAdd={onAddGallery}
        />
      </GlassCard>
    </div>
  );
}
