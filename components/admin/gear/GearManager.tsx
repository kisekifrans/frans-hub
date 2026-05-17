"use client";

import { useState } from "react";
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
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GearItemEditor } from "@/components/admin/gear/GearItemEditor";
import { sortGearCategories } from "@/lib/gear/group";
import type { GearCategory, GearItem } from "@/lib/gear/types";
import { useGearAdmin } from "@/hooks/useGearAdmin";
import { cn } from "@/lib/utils";

function SortableGearItem({
  item,
  profileId,
  saving,
  onChange,
  onSave,
  onRemove,
}: {
  item: GearItem;
  profileId: string;
  saving: boolean;
  onChange: (patch: Partial<GearItem>) => void;
  onSave: (patch?: Partial<GearItem>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-10 opacity-90")}
    >
      <GearItemEditor
        item={item}
        profileId={profileId}
        saving={saving}
        onChange={onChange}
        onSave={onSave}
        onRemove={onRemove}
        dragHandle={
          <button
            type="button"
            className="cursor-grab touch-none rounded-lg p-2 text-zinc-400 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Urutkan"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}

export function GearManager() {
  const gear = useGearAdmin();
  const [newCategory, setNewCategory] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (gear.loading || !gear.profileId) {
    return (
      <p className="text-sm text-zinc-500">Memuat gear admin…</p>
    );
  }

  const categories = sortGearCategories(gear.categories);

  const handleItemDragEnd = (categoryId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const catItems = gear.items
      .filter((i) => i.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
    const oldIndex = catItems.findIndex((i) => i.id === active.id);
    const newIndex = catItems.findIndex((i) => i.id === over.id);
    const reordered = [...catItems];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    gear.reorderItemsInCategory(categoryId, reordered);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          Kelola gear showcase. Publik:{" "}
          <Link href="/gear" className="font-medium text-violet-600 underline dark:text-violet-300">
            /gear
          </Link>
        </p>
        {gear.saving ? (
          <span className="text-xs text-violet-600">Menyimpan…</span>
        ) : null}
      </div>

      <GlassCard padding="lg" className="max-w-2xl space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Deskripsi setup
        </h3>
        <textarea
          defaultValue={gear.settings.setupDescription}
          key={gear.settings.setupDescription}
          onBlur={(e) =>
            gear.saveSettings({ setupDescription: e.target.value })
          }
          rows={3}
          className="w-full resize-none rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
          placeholder="Contoh: Setup streaming & gaming daily driver…"
        />
        <p className="text-xs text-zinc-500">
          Profil (nama, bio, avatar, sosial) di tab Profile admin.
        </p>
      </GlassCard>

      <GlassCard padding="md" className="space-y-3">
        <h3 className="text-sm font-semibold">Kategori</h3>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void gear.addCategory(newCategory);
            setNewCategory("");
          }}
        >
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nama kategori baru"
            className="min-w-0 flex-1 rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5"
          />
          <button
            type="submit"
            disabled={gear.saving}
            className="glass-card rounded-xl px-4 py-2 text-sm font-medium"
          >
            Tambah
          </button>
        </form>
      </GlassCard>

      {categories.map((cat: GearCategory) => {
        const catItems = gear.items
          .filter((i) => i.categoryId === cat.id)
          .sort((a, b) => a.order - b.order);

        return (
          <section key={cat.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {cat.name}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => gear.addItem(cat.id)}
                  disabled={gear.saving}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Hapus kategori “${cat.name}” dan semua item?`)) {
                      void gear.removeCategory(cat.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd(cat.id)}
            >
              <SortableContext
                items={catItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {catItems.length === 0 ? (
                    <p className="text-xs text-zinc-500">Belum ada item.</p>
                  ) : (
                    catItems.map((item) => (
                      <SortableGearItem
                        key={item.id}
                        item={item}
                        profileId={gear.profileId!}
                        saving={gear.saving}
                        onChange={(patch) => gear.patchItem(item.id, patch)}
                        onSave={(patch) => void gear.saveItem(item.id, patch)}
                        onRemove={() => {
                          if (window.confirm(`Hapus “${item.name}”?`)) {
                            void gear.removeItem(item.id);
                          }
                        }}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        );
      })}
    </div>
  );
}
