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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { AdminField } from "@/components/admin/AdminField";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CollectionGalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GalleryManagerProps {
  profileId: string;
  collectionId: string;
  images: CollectionGalleryImage[];
  onChange: (images: CollectionGalleryImage[]) => void;
  onAdd: () => void;
}

export function GalleryManager({
  profileId,
  collectionId,
  images,
  onChange,
  onAdd,
}: GalleryManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sorted = [...images].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((i) => i.id === active.id);
    const newIndex = sorted.findIndex((i) => i.id === over.id);
    const next = [...sorted];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  const patch = (id: string, patch: Partial<CollectionGalleryImage>) => {
    onChange(sorted.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  };

  const remove = (id: string) => {
    onChange(
      sorted.filter((i) => i.id !== id).map((img, i) => ({ ...img, order: i })),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Lookbook gallery
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white/55 dark:hover:bg-white/15"
        >
          <Plus className="h-3.5 w-3.5" />
          Add image
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sorted.map((i) => i.id)} strategy={rectSortingStrategy}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sorted.map((image) => (
              <SortableGalleryItem
                key={image.id}
                image={image}
                profileId={profileId}
                collectionId={collectionId}
                onPatch={(p) => patch(image.id, p)}
                onRemove={() => remove(image.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableGalleryItem({
  image,
  profileId,
  collectionId,
  onPatch,
  onRemove,
}: {
  image: CollectionGalleryImage;
  profileId: string;
  collectionId: string;
  onPatch: (p: Partial<CollectionGalleryImage>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-50 opacity-90")}
    >
      <GlassCard padding="sm" className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="touch-none rounded p-1 text-zinc-400"
            aria-label="Drag"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-rose-500 hover:bg-rose-500/10"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <MediaUpload
          profileId={profileId}
          blockId={`${collectionId}/gallery-${image.id}`}
          folder="collections"
          label="Gallery image"
          previewAspect="portrait"
          maxSizeMb={12}
          currentUrl={image.url}
          storagePath={image.storagePath}
          onUploaded={(url, storagePath) => onPatch({ url, storagePath })}
          onClear={() => onPatch({ url: "", storagePath: undefined })}
        />
        <AdminField
          label="Alt text"
          value={image.alt}
          onChange={(alt) => onPatch({ alt })}
        />
      </GlassCard>
    </li>
  );
}
