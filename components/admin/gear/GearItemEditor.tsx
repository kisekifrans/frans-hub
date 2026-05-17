"use client";

import { useCallback, useRef } from "react";
import { Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { ThumbnailFocusEditor } from "@/components/admin/ThumbnailFocusEditor";
import { GearCard } from "@/components/gear/GearCard";
import { DEFAULT_THUMBNAIL_FOCUS } from "@/lib/thumbnail-focus";
import type { ThumbnailFocus } from "@/lib/thumbnail-focus";
import type { GearItem } from "@/lib/gear/types";
import { isValidImageSrc } from "@/lib/image-utils";
import { mediaReactKey } from "@/lib/media-url";

interface GearItemEditorProps {
  item: GearItem;
  profileId: string;
  saving: boolean;
  onChange: (patch: Partial<GearItem>) => void;
  onSave: (patch?: Partial<GearItem>) => void | Promise<void>;
  onRemove: () => void;
  dragHandle?: React.ReactNode;
}

export function GearItemEditor({
  item,
  profileId,
  saving,
  onChange,
  onSave,
  onRemove,
  dragHandle,
}: GearItemEditorProps) {
  const focusDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveFocus = useCallback(
    (focus: ThumbnailFocus, immediate = false) => {
      if (immediate) {
        void onSave({ imageFocus: focus });
        return;
      }
      onChange({ imageFocus: focus });
    },
    [onChange, onSave],
  );

  const scheduleFocus = (focus: ThumbnailFocus) => {
    if (focusDebounce.current) clearTimeout(focusDebounce.current);
    focusDebounce.current = setTimeout(() => saveFocus(focus, true), 450);
  };

  return (
    <GlassCard padding="md" className="space-y-4">
      <div className="flex items-center gap-2">
        {dragHandle}
        <input
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => void onSave()}
          className="min-w-0 flex-1 rounded-lg border border-white/25 bg-white/40 px-3 py-2 text-sm font-semibold dark:bg-white/5"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={saving}
          className="rounded-lg p-2 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500"
          aria-label="Hapus item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-xs font-medium text-zinc-500">
            Deskripsi singkat
            <textarea
              value={item.description}
              onChange={(e) => onChange({ description: e.target.value })}
              onBlur={() => void onSave()}
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
            />
          </label>
          <label className="block text-xs font-medium text-zinc-500">
            Link produk
            <input
              value={item.productUrl ?? ""}
              onChange={(e) => onChange({ productUrl: e.target.value })}
              onBlur={() => void onSave()}
              className="mt-1 w-full rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
              placeholder="https://"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-medium text-zinc-500">
              Harga (opsional)
              <input
                type="number"
                min={0}
                value={item.price ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  onChange({ price: v === "" ? null : Number(v) });
                }}
                onBlur={() => void onSave()}
                className="mt-1 w-full rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
                placeholder="—"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-500">
              Mata uang
              <input
                value={item.priceCurrency}
                onChange={(e) => onChange({ priceCurrency: e.target.value })}
                onBlur={() => void onSave()}
                className="mt-1 w-full rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.featured}
                onChange={(e) => onSave({ featured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => onSave({ enabled: e.target.checked })}
              />
              Tampilkan
            </label>
          </div>

          <MediaUpload
            profileId={profileId}
            blockId={item.id}
            folder="gear"
            label="Gambar / GIF"
            accept="image/*,.gif"
            currentUrl={item.imageUrl}
            storagePath={item.storagePath}
            previewAspect="square"
            previewFocus={item.imageFocus}
            maxSizeMb={12}
            onUploaded={(url, storagePath) => {
              void onSave({ imageUrl: url, storagePath });
            }}
            onClear={() => {
              void onSave({
                imageUrl: undefined,
                storagePath: undefined,
                imageFocus: DEFAULT_THUMBNAIL_FOCUS,
              });
            }}
          />

          {isValidImageSrc(item.imageUrl) ? (
            <ThumbnailFocusEditor
              key={mediaReactKey("gear-editor", item.id, item.imageUrl)}
              imageUrl={item.imageUrl!}
              layout="side"
              mediaKey={item.id}
              focus={item.imageFocus}
              onChange={(f) => scheduleFocus(f)}
              onResetFocus={() => saveFocus({ ...DEFAULT_THUMBNAIL_FOCUS }, true)}
            />
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-500">Pratinjau kartu</p>
          <div className="max-w-xs">
            <GearCard item={{ ...item }} featured={item.featured} />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
