"use client";

import { useCallback, useEffect, useState } from "react";
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
  saveGearCategories,
  saveGearItems,
  saveGearPageSettings,
  updateGearItem,
} from "@/lib/supabase/gear-service";
import { generateId } from "@/lib/utils";

function newItemId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : generateId("gear");
}

export function useGearAdmin() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [settings, setSettings] = useState<GearPageSettings>({
    setupDescription: "",
  });
  const [categories, setCategories] = useState<GearCategory[]>([]);
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<SupabaseClient | null>(null);

  const getClient = useCallback(() => {
    if (client) return client;
    const c = createClient();
    setClient(c);
    return c;
  }, [client]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      toast.error("Supabase belum dikonfigurasi.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getClient();
      const page = await fetchGearPage(supabase, { includeDisabled: true });
      setProfileId(page.profileId);
      setSettings(page.settings);
      setCategories(page.categories);
      setItems(page.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat gear.");
    } finally {
      setLoading(false);
    }
  }, [getClient]);

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

  const persistItems = useCallback(
    async (next: GearItem[]) => {
      if (!profileId) return;
      setItems(next);
      setSaving(true);
      try {
        await saveGearItems(getClient(), profileId, next);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan item");
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

      let merged: GearItem | undefined;
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === id ? { ...i, ...patch } : i,
        );
        merged = next.find((i) => i.id === id);
        return next;
      });

      if (!merged) return null;

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
    (categoryId: string, reordered: GearItem[]) => {
      const others = items.filter((i) => i.categoryId !== categoryId);
      const merged = [
        ...others,
        ...reordered.map((item, i) => ({ ...item, order: i })),
      ];
      void persistItems(merged);
    },
    [items, persistItems],
  );

  return {
    profileId,
    settings,
    categories,
    items,
    loading,
    saving,
    saveSettings,
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
