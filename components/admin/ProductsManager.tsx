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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { AdminField } from "@/components/admin/AdminField";
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

  const setPreview = (
    id: string,
    url: string,
    storagePath: string,
  ) => {
    const isGif = /\.gif(\?|$)/i.test(url);
    if (isGif) {
      patch(id, {
        gifUrl: url,
        gifStoragePath: storagePath,
        imageUrl: undefined,
        imageStoragePath: undefined,
      });
    } else {
      patch(id, {
        imageUrl: url,
        imageStoragePath: storagePath,
        gifUrl: undefined,
        gifStoragePath: undefined,
      });
    }
  };

  const clearPreview = (id: string) => {
    patch(id, {
      imageUrl: undefined,
      imageStoragePath: undefined,
      gifUrl: undefined,
      gifStoragePath: undefined,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Curated picks
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white/55 dark:hover:bg-white/15"
        >
          <Plus className="h-3.5 w-3.5" />
          Add pick
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
          <ul className="grid gap-2 sm:grid-cols-2">
            {sorted.map((product) => (
              <SortablePick
                key={product.id}
                product={product}
                profileId={profileId}
                collectionId={collectionId}
                previewUrl={product.gifUrl ?? product.imageUrl}
                previewPath={
                  product.gifStoragePath ?? product.imageStoragePath
                }
                onPatch={(p) => patch(product.id, p)}
                onRemove={() => remove(product.id)}
                onPreview={(url, path) => setPreview(product.id, url, path)}
                onClearPreview={() => clearPreview(product.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortablePick({
  product,
  profileId,
  collectionId,
  previewUrl,
  previewPath,
  onPatch,
  onRemove,
  onPreview,
  onClearPreview,
}: {
  product: CollectionProduct;
  profileId: string;
  collectionId: string;
  previewUrl?: string;
  previewPath?: string;
  onPatch: (p: Partial<CollectionProduct>) => void;
  onRemove: () => void;
  onPreview: (url: string, path: string) => void;
  onClearPreview: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-50 opacity-90")}
    >
      <GlassCard padding="sm" className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="touch-none rounded p-1 text-zinc-400"
            aria-label="Drag"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <label className="ml-auto flex items-center gap-1 text-[10px]">
            <input
              type="checkbox"
              checked={product.enabled}
              onChange={(e) => onPatch({ enabled: e.target.checked })}
            />
            Visible
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-rose-500"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <AdminField
          label="Title"
          value={product.title}
          onChange={(title) => onPatch({ title })}
        />
        <AdminField
          label="Affiliate URL"
          value={product.affiliateUrl}
          onChange={(affiliateUrl) => onPatch({ affiliateUrl })}
          type="url"
        />
        <AdminField
          label="Caption (optional)"
          value={product.description}
          onChange={(description) => onPatch({ description })}
        />
        <MediaUpload
          profileId={profileId}
          blockId={`${collectionId}/pick-${product.id}`}
          folder="collections"
          label="Preview (image or GIF)"
          accept="image/*,.gif,video/mp4,video/webm"
          previewAspect="square"
          maxSizeMb={12}
          allowVideo
          currentUrl={previewUrl}
          storagePath={previewPath}
          onUploaded={onPreview}
          onClear={onClearPreview}
        />
      </GlassCard>
    </li>
  );
}
