"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import type {
  GearCategory,
  GearItem,
  GearPageSettings,
} from "@/lib/gear/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createGearCategory,
  createGearItem,
  deleteGearCategory,
  deleteGearItem,
  fetchGearPage,
  fetchGearPageForUser,
  saveGearCategories,
  reorderGearItems,
  saveGearPageSettings,
  setGearEnabledForUser,
  updateGearItem,
} from "@/lib/supabase/gear-service";
import { generateId } from "@/lib/utils";

function newItemId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : generateId("gear");
}

export type GearAdminMode = "site" | "user";

export function useGearAdmin(mode: GearAdminMode = "site") {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [gearEnabled, setGearEnabled] = useState(false);
  const [settings, setSettings] = useState<GearPageSettings>({
    setupDescription: "",
  });
  const [categories, setCategories] = useState<GearCategory[]>([]);
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const clientRef = useRef<SupabaseClient | null>(null);
  const itemsRef = useRef<GearItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = createClient();
    }
    return clientRef.current;
  }, []);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setLoadError("Supabase is not configured.");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = getClient();
      if (mode === "user") {
        const page = await fetchGearPageForUser(supabase);
        setProfileId(page.profileId);
        setGearEnabled(page.gearEnabled);
        setSettings(page.settings);
        setCategories(page.categories);
        setItems(page.items);
      } else {
        const page = await fetchGearPage(supabase, { includeDisabled: true });
        setProfileId(page.profileId);
        setGearEnabled(true); // site profile is always public for gear
        setSettings(page.settings);
        setCategories(page.categories);
        setItems(page.items);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Couldn't load gear.";
      setLoadError(message);
      // Only toast in site mode; user mode shows an inline error card.
      if (mode === "site") toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [getClient, mode]);

  const toggleGearEnabled = useCallback(
    async (next: boolean) => {
      if (mode !== "user") return;
      setSaving(true);
      const prev = gearEnabled;
      setGearEnabled(next);
      try {
        await setGearEnabledForUser(getClient(), next);
        toast.success(
          next ? "Gear page is now public" : "Gear page hidden",
        );
      } catch (e) {
        setGearEnabled(prev);
        toast.error(e instanceof Error ? e.message : "Couldn't update");
      } finally {
        setSaving(false);
      }
    },
    [mode, gearEnabled, getClient],
  );

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = useCallback(
    async (next: GearPageSettings) => {
      if (!profileId) return;
      setSaving(true);
      try {
        await saveGearPageSettings(getClient(), profileId, next);
        setSettings(next);
        toast.success("Pengaturan gear disimpan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
      } finally {
        setSaving(false);
      }
    },
    [profileId, getClient],
  );

  const persistCategories = useCallback(
    async (next: GearCategory[]) => {
      if (!profileId) return;
      setCategories(next);
      setSaving(true);
      try {
        await saveGearCategories(getClient(), profileId, next);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan kategori");
        await load();
      } finally {
        setSaving(false);
      }
    },
    [profileId, getClient, load],
  );

  /** Local-only update (text fields while typing). */
  const patchItem = useCallback((id: string, patch: Partial<GearItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }, []);

  /**
   * Merge patch into state synchronously, persist to Supabase, then sync
   * canonical row from DB (cache-busted image URL, featured, enabled, etc.).
   */
  const persistItem = useCallback(
    async (id: string, patch: Partial<GearItem> = {}) => {
      if (!profileId) return null;

      const current = itemsRef.current.find((i) => i.id === id);
      if (!current) return null;

      const merged: GearItem = { ...current, ...patch };
      setItems((prev) => prev.map((i) => (i.id === id ? merged : i)));

      setSaving(true);
      try {
        const saved = await updateGearItem(getClient(), profileId, merged);
        setItems((prev) => prev.map((i) => (i.id === id ? saved : i)));
        return saved;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan item");
        await load();
        return null;
      } finally {
        setSaving(false);
      }
    },
    [profileId, getClient, load],
  );

  const addCategory = useCallback(
    async (name: string) => {
      if (!profileId) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      setSaving(true);
      try {
        const created = await createGearCategory(
          getClient(),
          profileId,
          trimmed,
          categories.length,
        );
        setCategories((c) => [...c, created]);
        toast.success("Kategori ditambahkan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menambah kategori");
      } finally {
        setSaving(false);
      }
    },
    [profileId, categories.length, getClient],
  );

  const removeCategory = useCallback(
    async (categoryId: string) => {
      if (!profileId) return;
      setSaving(true);
      try {
        await deleteGearCategory(getClient(), categoryId);
        setCategories((c) => c.filter((x) => x.id !== categoryId));
        setItems((list) => list.filter((i) => i.categoryId !== categoryId));
        toast.success("Kategori dihapus");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menghapus");
      } finally {
        setSaving(false);
      }
    },
    [profileId, getClient],
  );

  const reorderCategories = useCallback(
    (next: GearCategory[]) => {
      const ordered = next.map((c, i) => ({ ...c, order: i }));
      void persistCategories(ordered);
    },
    [persistCategories],
  );

  const addItem = useCallback(
    async (categoryId: string) => {
      if (!profileId) return;
      const order = items.filter((i) => i.categoryId === categoryId).length;
      const item: GearItem = {
        id: newItemId(),
        categoryId,
        name: "Produk baru",
        description: "",
        price: null,
        priceCurrency: "IDR",
        featured: false,
        enabled: true,
        order,
        createdAt: new Date().toISOString(),
      };
      setSaving(true);
      try {
        const created = await createGearItem(getClient(), profileId, item);
        setItems((list) => [...list, created]);
        toast.success("Item ditambahkan");
        return created;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menambah item");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [profileId, items, getClient],
  );

  const saveItem = useCallback(
    async (id: string, patch: Partial<GearItem> = {}) => {
      const saved = await persistItem(id, patch);
      if (saved) toast.success("Item disimpan");
      return saved;
    },
    [persistItem],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setSaving(true);
      try {
        await deleteGearItem(getClient(), itemId);
        setItems((list) => list.filter((i) => i.id !== itemId));
        toast.success("Item dihapus");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menghapus");
      } finally {
        setSaving(false);
      }
    },
    [getClient],
  );

  const reorderItemsInCategory = useCallback(
    async (categoryId: string, reordered: GearItem[]) => {
      const withOrder = reordered.map((item, i) => ({ ...item, order: i }));
      setItems((prev) => {
        const others = prev.filter((i) => i.categoryId !== categoryId);
        return [...others, ...withOrder];
      });
      setSaving(true);
      try {
        await reorderGearItems(
          getClient(),
          withOrder.map((item) => ({ id: item.id, order: item.order })),
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan urutan");
        await load();
      } finally {
        setSaving(false);
      }
    },
    [getClient, load],
  );

  return {
    profileId,
    gearEnabled,
    mode,
    loadError,
    settings,
    categories,
    items,
    loading,
    saving,
    saveSettings,
    toggleGearEnabled,
    addCategory,
    removeCategory,
    reorderCategories,
    addItem,
    patchItem,
    persistItem,
    saveItem,
    removeItem,
    reorderItemsInCategory,
    reload: load,
  };
}
