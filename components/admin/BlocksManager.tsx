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
import { GlassCard } from "@/components/ui/GlassCard";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { ThumbnailFocusEditor } from "@/components/admin/ThumbnailFocusEditor";
import { DEFAULT_THUMBNAIL_FOCUS } from "@/lib/thumbnail-focus";
import { isValidImageSrc } from "@/lib/image-utils";
import type { BlockType, ProfileBlock } from "@/lib/types";
import { sortBlocks } from "@/lib/store";
import { cn } from "@/lib/utils";

const blockLabels: Record<BlockType, string> = {
  link: "Link",
  gif: "GIF",
  tiktok: "TikTok Embed",
  instagram: "Instagram Embed",
};

interface BlocksManagerProps {
  profileId: string;
  blocks: ProfileBlock[];
  saving: boolean;
  onAdd: (type: BlockType) => void;
  onPatch: (id: string, patch: Partial<ProfileBlock>) => void;
  onRemove: (id: string) => void;
  onReorder: (blocks: ProfileBlock[]) => void;
}

export function BlocksManager({
  profileId,
  blocks,
  saving,
  onAdd,
  onPatch,
  onRemove,
  onReorder,
}: BlocksManagerProps) {
  const sorted = sortBlocks(blocks);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((b) => b.id === active.id);
    const newIndex = sorted.findIndex((b) => b.id === over.id);
    const reordered = [...sorted];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((b, i) => ({ ...b, order: i })));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(blockLabels) as BlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            disabled={saving}
            onClick={() => onAdd(type)}
            className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/60 disabled:opacity-50 dark:hover:bg-white/15"
          >
            <Plus className="h-4 w-4" />
            {blockLabels[type]}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-3">
            {sorted.map((block) => (
              <SortableBlockEditor
                key={block.id}
                block={block}
                profileId={profileId}
                onPatch={onPatch}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableBlockEditor({
  block,
  profileId,
  onPatch,
  onRemove,
}: {
  block: ProfileBlock;
  profileId: string;
  onPatch: (id: string, patch: Partial<ProfileBlock>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-50 scale-[1.02] opacity-90")}
    >
      <GlassCard padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="touch-none rounded-lg p-1 text-zinc-400 hover:bg-white/30"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
              {blockLabels[block.type]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={block.enabled}
                onChange={(e) => onPatch(block.id, { enabled: e.target.checked })}
              />
              Visible
            </label>
            <button
              type="button"
              onClick={() => onRemove(block.id)}
              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10"
              aria-label="Delete block"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {block.type === "link" && (
          <>
            <Field
              label="Title"
              value={block.title}
              onBlur={(v) => onPatch(block.id, { title: v })}
            />
            <Field
              label="Link URL"
              value={block.url}
              onBlur={(v) => onPatch(block.id, { url: v })}
            />
            <label className="block text-xs font-medium text-zinc-500">
              Thumbnail layout
              <select
                value={block.thumbnailLayout ?? "side"}
                onChange={(e) =>
                  onPatch(block.id, {
                    thumbnailLayout: e.target.value as "side" | "banner",
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm dark:bg-white/10"
              >
                <option value="side">Side</option>
                <option value="banner">Banner</option>
              </select>
            </label>
            <MediaUpload
              profileId={profileId}
              blockId={block.id}
              folder="thumbnails"
              label="Thumbnail image or GIF"
              accept="image/*,.gif"
              currentUrl={block.thumbnailUrl}
              storagePath={block.storagePath}
              previewFocus={block.thumbnailFocus}
              onUploaded={(url, storagePath) =>
                onPatch(block.id, {
                  thumbnailUrl: url,
                  storagePath,
                  thumbnailFocus: { ...DEFAULT_THUMBNAIL_FOCUS },
                })
              }
              onClear={() =>
                onPatch(block.id, {
                  thumbnailUrl: undefined,
                  storagePath: undefined,
                  thumbnailFocus: undefined,
                })
              }
            />
            {isValidImageSrc(block.thumbnailUrl) && (
              <ThumbnailFocusEditor
                imageUrl={block.thumbnailUrl!}
                layout={block.thumbnailLayout ?? "side"}
                focus={block.thumbnailFocus}
                previewTitle={block.title}
                onChange={(thumbnailFocus) =>
                  onPatch(block.id, { thumbnailFocus })
                }
              />
            )}
          </>
        )}

        {block.type === "gif" && (
          <>
            <MediaUpload
              profileId={profileId}
              blockId={block.id}
              folder="gifs"
              label="GIF / image"
              accept="image/*,.gif"
              previewAspect="video"
              currentUrl={block.url}
              storagePath={block.storagePath}
              onUploaded={(url, storagePath) =>
                onPatch(block.id, { url, storagePath })
              }
              onClear={() =>
                onPatch(block.id, { url: "", storagePath: undefined })
              }
            />
            <Field
              label="Caption"
              value={block.caption ?? ""}
              onBlur={(v) => onPatch(block.id, { caption: v })}
            />
          </>
        )}

        {(block.type === "tiktok" || block.type === "instagram") && (
          <Field
            label="Post URL"
            value={block.url}
            onBlur={(v) => onPatch(block.id, { url: v })}
          />
        )}
      </GlassCard>
    </li>
  );
}

function Field({
  label,
  value,
  onBlur,
}: {
  label: string;
  value: string;
  onBlur: (v: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">
      {label}
      <input
        type="text"
        defaultValue={value}
        key={`${label}-${value}`}
        onBlur={(e) => onBlur(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white"
      />
    </label>
  );
}
