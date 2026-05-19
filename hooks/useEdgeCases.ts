"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { filterEdgeCases, uniqueProjects } from "@/lib/edgecases/filters";
import type { EdgeCase, EdgeCaseFilters, EdgeCaseInput } from "@/lib/edgecases/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createEdgeCase,
  deleteEdgeCase,
  fetchEdgeCases,
  toggleEdgeCaseFavorite,
  updateEdgeCase,
} from "@/lib/supabase/edgecases-service";

const DEFAULT_FILTERS: EdgeCaseFilters = {
  search: "",
  decision: "all",
  project: "all",
  favoritesOnly: false,
  datePreset: "all",
};

export function useEdgeCases() {
  const [items, setItems] = useState<EdgeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<EdgeCaseFilters>(DEFAULT_FILTERS);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      toast.error("Supabase belum dikonfigurasi.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const list = await fetchEdgeCases(supabase);
      setItems(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat edge cases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(
    () => filterEdgeCases(items, filters),
    [items, filters],
  );

  const projects = useMemo(() => uniqueProjects(items), [items]);

  const addCase = useCallback(
    async (input: EdgeCaseInput, presetId?: string) => {
      setSaving(true);
      try {
        const supabase = createClient();
        const created = await createEdgeCase(supabase, input, presetId);
        setItems((prev) => [created, ...prev]);
        toast.success("Edge case ditambahkan");
        return created;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const saveCase = useCallback(async (item: EdgeCase) => {
    const prev = items;
    setItems((list) => list.map((x) => (x.id === item.id ? item : x)));
    setSaving(true);
    try {
      const supabase = createClient();
      const saved = await updateEdgeCase(supabase, item);
      setItems((list) => list.map((x) => (x.id === saved.id ? saved : x)));
      toast.success("Edge case disimpan");
      return saved;
    } catch (e) {
      setItems(prev);
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
      throw e;
    } finally {
      setSaving(false);
    }
  }, [items]);

  const removeCase = useCallback(async (id: string) => {
    const prev = items;
    setItems((list) => list.filter((x) => x.id !== id));
    setSaving(true);
    try {
      const supabase = createClient();
      await deleteEdgeCase(supabase, id);
      toast.success("Edge case dihapus");
    } catch (e) {
      setItems(prev);
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
      throw e;
    } finally {
      setSaving(false);
    }
  }, [items]);

  const duplicateCase = useCallback(
    async (source: EdgeCase) => {
      const copy: EdgeCaseInput = {
        episodeId: source.episodeId,
        qaUrl: source.qaUrl,
        uploadedVideoPath: undefined,
        thumbnailPath: undefined,
        projectName: source.projectName,
        taskId: source.taskId,
        taskDescription: source.taskDescription,
        title: `${source.title} (copy)`,
        description: source.description,
        decision: source.decision,
        rejectReason: source.rejectReason,
        tags: [...source.tags],
        notes: source.notes,
      };
      return addCase(copy);
    },
    [addCase],
  );

  const toggleFavorite = useCallback(async (item: EdgeCase) => {
    const optimistic = { ...item, isFavorite: !item.isFavorite };
    setItems((list) => list.map((x) => (x.id === item.id ? optimistic : x)));
    try {
      const supabase = createClient();
      const saved = await toggleEdgeCaseFavorite(supabase, item);
      setItems((list) => list.map((x) => (x.id === saved.id ? saved : x)));
    } catch (e) {
      setItems((list) => list.map((x) => (x.id === item.id ? item : x)));
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui favorit");
    }
  }, []);

  return {
    items,
    filteredItems,
    projects,
    loading,
    saving,
    filters,
    setFilters,
    reload: load,
    addCase,
    saveCase,
    removeCase,
    duplicateCase,
    toggleFavorite,
  };
}
