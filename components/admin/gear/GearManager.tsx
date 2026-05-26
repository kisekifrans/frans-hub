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
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Headphones,
  Keyboard,
  Loader2,
  Monitor,
  Mouse,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useGearAdmin, type GearAdminMode } from "@/hooks/useGearAdmin";
import { cn } from "@/lib/utils";

function UserGearWelcome({
  gearEnabled,
  publicHref,
  publicLabel,
  onTurnPublic,
  saving,
}: {
  gearEnabled: boolean;
  publicHref: string;
  publicLabel: string;
  onTurnPublic: () => void;
  saving: boolean;
}) {
  return (
    <GlassCard
      padding="lg"
      className="relative overflow-hidden border-violet-200/40 bg-gradient-to-br from-white/60 via-violet-50/35 to-fuchsia-50/35 dark:from-zinc-900/45 dark:via-violet-950/30 dark:to-fuchsia-950/30"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative space-y-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
            <Sparkles className="h-3 w-3" aria-hidden />
            Setup studio
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-[1.4rem]">
            Welcome to your setup page.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Three steps. Add gear, pick a couple of favorites to feature, and
            flip it public when you&apos;re ready.
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          {[
            { Icon: Mouse, label: "1. Add categories & items" },
            { Icon: Keyboard, label: "2. Set a few as featured" },
            { Icon: Monitor, label: "3. Toggle public to share" },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-xl border border-white/40 bg-white/40 px-3 py-2.5 text-[11px] font-medium text-zinc-700 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-200"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-200">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
            <Headphones className="h-3 w-3" aria-hidden />
            Mouse · Keyboard · Audio · Display
          </span>
          {gearEnabled ? (
            <Link
              href={publicHref}
              className="text-[11px] font-medium text-violet-600 underline dark:text-violet-300"
            >
              View live: {publicLabel}
            </Link>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={onTurnPublic}
              className="rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-violet-500"
            >
              Make it public when ready
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

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

export interface GearManagerProps {
  mode?: GearAdminMode;
  /** Public URL to link to (e.g. "/id/gear" or "/id/u/<slug>/gear"). */
  publicHref?: string;
  /** Visible label shown next to "Public:". */
  publicLabel?: string;
}

export function GearManager({
  mode = "site",
  publicHref = "/id/gear",
  publicLabel = "/gear",
}: GearManagerProps = {}) {
  const gear = useGearAdmin(mode);
  const [newCategory, setNewCategory] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const isUserMode = mode === "user";

  if (gear.loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
        Loading your setup…
      </div>
    );
  }

  if (gear.loadError || !gear.profileId) {
    // Detect the most common cause: migration 021 hasn't been applied yet.
    const looksLikeMissingMigration =
      gear.loadError?.toLowerCase().includes("gear_enabled") ||
      gear.loadError?.includes("42703");

    return (
      <GlassCard padding="lg" className="space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {looksLikeMissingMigration
                ? "Setup is almost ready"
                : "Couldn't load your setup"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {looksLikeMissingMigration ? (
                <>
                  Your account is fine — your gear table just needs one last
                  migration to come online. Try again in a minute, or refresh.
                </>
              ) : (
                gear.loadError ?? "Something went wrong fetching your gear."
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void gear.reload()}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </GlassCard>
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

  const showWelcome = isUserMode && gear.items.length === 0;

  return (
    <div className="space-y-6">
      {showWelcome && (
        <UserGearWelcome
          gearEnabled={gear.gearEnabled}
          publicHref={publicHref}
          publicLabel={publicLabel}
          saving={gear.saving}
          onTurnPublic={() => void gear.toggleGearEnabled(true)}
        />
      )}

      {isUserMode ? (
        <GlassCard padding="lg" className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Your setup, your way
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Showcase the gear behind your aura. Visitors see it at{" "}
                <Link
                  href={publicHref}
                  className="font-medium text-violet-600 underline dark:text-violet-300"
                >
                  {publicLabel}
                </Link>
                .
              </p>
            </div>
            <button
              type="button"
              disabled={gear.saving}
              onClick={() => void gear.toggleGearEnabled(!gear.gearEnabled)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                gear.gearEnabled
                  ? "bg-violet-600 text-white"
                  : "bg-white/40 text-zinc-600 hover:bg-white/60 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10",
              )}
            >
              {gear.gearEnabled ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Public
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Hidden
                </>
              )}
            </button>
          </div>
          {!gear.gearEnabled ? (
            <p className="text-xs text-zinc-500">
              Your gear page is hidden. Toggle to <b>Public</b> when you&apos;re ready.
            </p>
          ) : null}
        </GlassCard>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            Kelola gear showcase. Publik:{" "}
            <Link href={publicHref} className="font-medium text-violet-600 underline dark:text-violet-300">
              {publicLabel}
            </Link>
          </p>
          {gear.saving ? (
            <span className="text-xs text-violet-600">Menyimpan…</span>
          ) : null}
        </div>
      )}

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
