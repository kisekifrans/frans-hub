"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { AdminField, AdminSelect, AdminTextarea } from "@/components/admin/AdminField";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  COLLECTION_GRADIENT_PRESETS,
  COLLECTION_LAYOUT_STYLES,
  type Collection,
} from "@/lib/types";
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

  return (
    <div className="space-y-6">
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

      <GlassCard padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Collection details
          </h2>
          <label className="flex items-center gap-2 text-sm">
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
          hint={`Public URL: /${slugPreview}`}
        />
        <AdminTextarea
          label="Description"
          value={collection.description}
          onChange={(description) => patch({ description })}
        />
        <AdminTextarea
          label="Creator review"
          value={collection.reviewText ?? ""}
          onChange={(reviewText) => patch({ reviewText })}
          rows={4}
        />
      </GlassCard>

      <GlassCard padding="lg" className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">SEO</h2>
        <AdminField
          label="SEO title"
          value={collection.seoTitle ?? ""}
          onChange={(seoTitle) => patch({ seoTitle })}
        />
        <AdminTextarea
          label="SEO description"
          value={collection.seoDescription ?? ""}
          onChange={(seoDescription) => patch({ seoDescription })}
          rows={2}
        />
      </GlassCard>

      <GlassCard padding="lg" className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Hero media</h2>
        <MediaUpload
          profileId={profileId}
          blockId={`${collection.id}/hero-gif`}
          folder="collections"
          label="Hero GIF"
          accept="image/*,.gif"
          previewAspect="video"
          maxSizeMb={12}
          currentUrl={collection.heroGifUrl}
          storagePath={collection.heroGifStoragePath}
          onUploaded={(url, storagePath) =>
            patch({ heroGifUrl: url, heroGifStoragePath: storagePath })
          }
          onClear={() =>
            patch({ heroGifUrl: undefined, heroGifStoragePath: undefined })
          }
        />
        <MediaUpload
          profileId={profileId}
          blockId={`${collection.id}/hero-image`}
          folder="collections"
          label="Hero image"
          previewAspect="video"
          maxSizeMb={12}
          currentUrl={collection.heroImageUrl}
          storagePath={collection.heroImageStoragePath}
          onUploaded={(url, storagePath) =>
            patch({ heroImageUrl: url, heroImageStoragePath: storagePath })
          }
          onClear={() =>
            patch({ heroImageUrl: undefined, heroImageStoragePath: undefined })
          }
        />
        <AdminField
          label="Hero video URL (optional)"
          value={collection.heroVideoUrl ?? ""}
          onChange={(heroVideoUrl) => patch({ heroVideoUrl })}
          type="url"
          hint="MP4/WebM hosted URL if not using upload"
        />
      </GlassCard>

      <GlassCard padding="lg" className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Customization
        </h2>
        <AdminField
          label="Accent color"
          value={collection.accentColor ?? "#a78bfa"}
          onChange={(accentColor) => patch({ accentColor })}
          type="color"
        />
        <AdminSelect
          label="Background gradient"
          value={collection.gradientPreset}
          options={COLLECTION_GRADIENT_PRESETS}
          onChange={(gradientPreset) => patch({ gradientPreset })}
        />
        <AdminSelect
          label="Layout style"
          value={collection.layoutStyle}
          options={COLLECTION_LAYOUT_STYLES}
          onChange={(layoutStyle) => patch({ layoutStyle })}
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

      <GlassCard padding="lg">
        <ProductsManager
          profileId={profileId}
          collectionId={collection.id}
          products={collection.products}
          onChange={(products) => patch({ products })}
          onAdd={onAddProduct}
        />
      </GlassCard>
    </div>
  );
}
