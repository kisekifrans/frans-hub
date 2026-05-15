"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createCollectionAdmin,
  createEmptyGalleryImage,
  createEmptyProduct,
  deleteCollectionAdmin,
  fetchCollectionByIdAdmin,
  fetchCollectionsAdmin,
  getAdminProfileId,
  saveCollectionAdmin,
} from "@/lib/supabase/collections-admin-service";
import type { Collection } from "@/lib/types";

export function useCollections() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getClient = useCallback(() => createClient(), []);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      toast.error("Supabase is not configured");
      return;
    }
    setLoading(true);
    try {
      const supabase = getClient();
      const pid = await getAdminProfileId(supabase);
      if (!pid) {
        toast.error("Profile not found");
        setLoading(false);
        return;
      }
      setProfileId(pid);
      const list = await fetchCollectionsAdmin(supabase, pid);
      setCollections(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load collections");
    } finally {
      setLoading(false);
    }
  }, [getClient]);

  useEffect(() => {
    load();
  }, [load]);

  const createCollection = useCallback(async () => {
    if (!profileId) return null;
    setSaving(true);
    try {
      const supabase = getClient();
      const created = await createCollectionAdmin(supabase, profileId);
      setCollections((prev) => [...prev, created]);
      toast.success("Collection created");
      return created;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create collection");
      return null;
    } finally {
      setSaving(false);
    }
  }, [profileId, getClient]);

  const saveCollection = useCallback(
    async (collection: Collection, quiet = false) => {
      if (!profileId) return null;
      setSaving(true);
      try {
        const supabase = getClient();
        const saved = await saveCollectionAdmin(supabase, profileId, collection);
        setCollections((prev) =>
          prev.map((c) => (c.id === saved.id ? saved : c)),
        );
        if (!quiet) toast.success("Collection saved");
        return saved;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [profileId, getClient],
  );

  const removeCollection = useCallback(
    async (collectionId: string) => {
      setSaving(true);
      try {
        const supabase = getClient();
        await deleteCollectionAdmin(supabase, collectionId);
        setCollections((prev) => prev.filter((c) => c.id !== collectionId));
        toast.success("Collection deleted");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setSaving(false);
      }
    },
    [getClient],
  );

  const reloadCollection = useCallback(
    async (collectionId: string) => {
      const supabase = getClient();
      const fresh = await fetchCollectionByIdAdmin(supabase, collectionId);
      if (fresh) {
        setCollections((prev) =>
          prev.map((c) => (c.id === collectionId ? fresh : c)),
        );
      }
      return fresh;
    },
    [getClient],
  );

  return {
    profileId,
    collections,
    loading,
    saving,
    load,
    createCollection,
    saveCollection,
    removeCollection,
    reloadCollection,
    createEmptyProduct,
    createEmptyGalleryImage,
  };
}
