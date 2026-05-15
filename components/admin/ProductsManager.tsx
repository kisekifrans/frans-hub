"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminField, AdminTextarea } from "@/components/admin/AdminField";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CollectionProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductsManagerProps {
  profileId: string;
  collectionId: string;
  products: CollectionProduct[];
  onChange: (products: CollectionProduct[]) => void;
  onAdd: () => void;
}

export function ProductsManager({
  profileId,
  collectionId,
  products,
  onChange,
  onAdd,
}: ProductsManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sorted = [...products].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((p) => p.id === active.id);
    const newIndex = sorted.findIndex((p) => p.id === over.id);
    const next = [...sorted];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onChange(next.map((p, i) => ({ ...p, order: i })));
  };

  const patch = (id: string, patch: Partial<CollectionProduct>) => {
    onChange(sorted.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const remove = (id: string) => {
    onChange(
      sorted.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Product cards
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white/55 dark:hover:bg-white/15"
        >
          <Plus className="h-3.5 w-3.5" />
          Add product
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-3">
            {sorted.map((product) => (
              <SortableProductItem
                key={product.id}
                product={product}
                profileId={profileId}
                collectionId={collectionId}
                onPatch={(p) => patch(product.id, p)}
                onRemove={() => remove(product.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function TagsInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [raw, setRaw] = useState(tags.join(", "));

  return (
    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
      Tags (comma-separated)
      <input
        type="text"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(
            e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          );
        }}
        placeholder="streetwear, summer, sale"
        className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
      />
    </label>
  );
}

function SortableProductItem({
  product,
  profileId,
  collectionId,
  onPatch,
  onRemove,
}: {
  product: CollectionProduct;
  profileId: string;
  collectionId: string;
  onPatch: (p: Partial<CollectionProduct>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-50 opacity-90")}
    >
      <GlassCard padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              className="touch-none rounded p-1 text-zinc-400"
              aria-label="Drag"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="truncate text-sm font-semibold text-zinc-800 dark:text-white">
              {product.title || "Untitled product"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={product.enabled}
                onChange={(e) => onPatch({ enabled: e.target.checked })}
              />
              Visible
            </label>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="rounded p-1 text-zinc-500"
              aria-label={open ? "Collapse" : "Expand"}
            >
              {open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1 text-rose-500 hover:bg-rose-500/10"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {open && (
          <div className="space-y-3 border-t border-white/10 pt-3">
            <AdminField
              label="Title"
              value={product.title}
              onChange={(title) => onPatch({ title })}
            />
            <AdminTextarea
              label="Description"
              value={product.description}
              onChange={(description) => onPatch({ description })}
            />
            <AdminField
              label="Affiliate URL"
              value={product.affiliateUrl}
              onChange={(affiliateUrl) => onPatch({ affiliateUrl })}
              type="url"
            />
            <AdminField
              label="CTA button text"
              value={product.ctaLabel}
              onChange={(ctaLabel) => onPatch({ ctaLabel })}
            />
            <AdminField
              label="Category"
              value={product.category ?? ""}
              onChange={(category) => onPatch({ category })}
            />
            <TagsInput
              tags={product.tags}
              onChange={(tags) => onPatch({ tags })}
            />
            <AdminTextarea
              label="Creator review (product)"
              value={product.reviewText ?? ""}
              onChange={(reviewText) => onPatch({ reviewText })}
              rows={2}
            />
            <MediaUpload
              profileId={profileId}
              blockId={`${collectionId}/product-${product.id}-image`}
              folder="collections"
              label="Product image"
              previewAspect="portrait"
              maxSizeMb={12}
              currentUrl={product.imageUrl}
              storagePath={product.imageStoragePath}
              onUploaded={(url, storagePath) =>
                onPatch({ imageUrl: url, imageStoragePath: storagePath })
              }
              onClear={() =>
                onPatch({ imageUrl: undefined, imageStoragePath: undefined })
              }
            />
            <MediaUpload
              profileId={profileId}
              blockId={`${collectionId}/product-${product.id}-gif`}
              folder="collections"
              label="GIF / video preview"
              accept="image/*,.gif,video/mp4,video/webm"
              previewAspect="video"
              maxSizeMb={12}
              allowVideo
              currentUrl={product.gifUrl}
              storagePath={product.gifStoragePath}
              onUploaded={(url, storagePath) =>
                onPatch({ gifUrl: url, gifStoragePath: storagePath })
              }
              onClear={() =>
                onPatch({ gifUrl: undefined, gifStoragePath: undefined })
              }
            />
          </div>
        )}
      </GlassCard>
    </li>
  );
}
