"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_CATEGORIES, mergeCategories } from "@/lib/quickreply/categories";
import { applyPlaceholders } from "@/lib/quickreply/placeholders";
import { loadStore, newSnippetId, persistStore } from "@/lib/quickreply/storage";
import type {
  QuickReply,
  QuickReplyDraft,
  QuickReplyStore,
  SidebarFilter,
} from "@/lib/quickreply/types";

const EMPTY_DRAFT: QuickReplyDraft = {
  title: "",
  category: DEFAULT_CATEGORIES[0],
  content: "",
  pinned: false,
  favorite: false,
};

function sortSnippets(items: QuickReply[]): QuickReply[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

export function useQuickReplies() {
  const [store, setStore] = useState<QuickReplyStore | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SidebarFilter>({ type: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<QuickReplyDraft>(EMPTY_DRAFT);
  const [copyPulseId, setCopyPulseId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadStore();
    setStore(loaded);
    if (loaded.snippets[0]) setSelectedId(loaded.snippets[0].id);
  }, []);

  const persist = useCallback((next: QuickReplyStore) => {
    setStore(next);
    persistStore(next);
  }, []);

  const snippets = store?.snippets ?? [];
  const categories = useMemo(
    () =>
      mergeCategories(
        DEFAULT_CATEGORIES,
        store?.customCategories ?? [],
        snippets,
      ),
    [store?.customCategories, snippets],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = snippets;

    if (filter.type === "favorites") list = list.filter((s) => s.favorite);
    else if (filter.type === "pinned") list = list.filter((s) => s.pinned);
    else if (filter.type === "recent") {
      const ids = store?.recentIds ?? [];
      list = ids
        .map((id) => snippets.find((s) => s.id === id))
        .filter((s): s is QuickReply => Boolean(s));
    } else if (filter.type === "category") {
      list = list.filter((s) => s.category === filter.category);
    }

    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q),
      );
    }

    return sortSnippets(list);
  }, [snippets, filter, search, store?.recentIds]);

  const selected = snippets.find((s) => s.id === selectedId) ?? null;

  const previewText = useMemo(() => {
    if (editingId !== null) return draft.content;
    return selected?.content ?? "";
  }, [editingId, draft.content, selected?.content]);

  const updateStore = useCallback(
    (updater: (prev: QuickReplyStore) => QuickReplyStore) => {
      setStore((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        persistStore(next);
        return next;
      });
    },
    [],
  );

  const copySnippet = useCallback(
    async (snippet: QuickReply) => {
      const text = applyPlaceholders(snippet.content);
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Pesan berhasil disalin");
        setCopyPulseId(snippet.id);
        window.setTimeout(() => setCopyPulseId(null), 600);
        updateStore((prev) => {
          const recentIds = [
            snippet.id,
            ...prev.recentIds.filter((id) => id !== snippet.id),
          ].slice(0, 8);
          return { ...prev, recentIds };
        });
      } catch {
        toast.error("Gagal menyalin pesan");
      }
    },
    [updateStore],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      updateStore((prev) => ({
        ...prev,
        snippets: prev.snippets.map((s) =>
          s.id === id ? { ...s, favorite: !s.favorite, updatedAt: new Date().toISOString() } : s,
        ),
      }));
    },
    [updateStore],
  );

  const togglePinned = useCallback(
    (id: string) => {
      updateStore((prev) => ({
        ...prev,
        snippets: prev.snippets.map((s) =>
          s.id === id ? { ...s, pinned: !s.pinned, updatedAt: new Date().toISOString() } : s,
        ),
      }));
    },
    [updateStore],
  );

  const deleteSnippet = useCallback(
    (id: string) => {
      updateStore((prev) => ({
        ...prev,
        snippets: prev.snippets.filter((s) => s.id !== id),
        recentIds: prev.recentIds.filter((rid) => rid !== id),
      }));
      if (selectedId === id) {
        const remaining = snippets.filter((s) => s.id !== id);
        setSelectedId(remaining[0]?.id ?? null);
      }
      if (editingId === id) setEditingId(null);
      toast.success("Snippet dihapus");
    },
    [updateStore, selectedId, editingId, snippets],
  );

  const startCreate = useCallback(() => {
    setEditingId("new");
    setDraft({
      ...EMPTY_DRAFT,
      category: categories[0] ?? DEFAULT_CATEGORIES[0],
    });
    setSelectedId(null);
  }, [categories]);

  const startEdit = useCallback((snippet: QuickReply) => {
    setEditingId(snippet.id);
    setSelectedId(snippet.id);
    setDraft({
      title: snippet.title,
      category: snippet.category,
      content: snippet.content,
      pinned: snippet.pinned,
      favorite: snippet.favorite,
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    if (!selectedId && snippets[0]) setSelectedId(snippets[0].id);
  }, [selectedId, snippets]);

  const saveDraft = useCallback((): QuickReply | null => {
    const title = draft.title.trim();
    const content = draft.content.trim();
    const category = draft.category.trim() || DEFAULT_CATEGORIES[0];

    if (!title || !content) {
      toast.error("Judul dan isi pesan wajib diisi");
      return null;
    }

    const now = new Date().toISOString();
    const customCategories = store?.customCategories ?? [];
    const nextCustom = (DEFAULT_CATEGORIES as readonly string[]).includes(
      category,
    )
      ? customCategories
      : customCategories.includes(category)
        ? customCategories
        : [...customCategories, category];

    let saved: QuickReply | null = null;

    if (editingId === "new") {
      const created: QuickReply = {
        id: newSnippetId(),
        title,
        category,
        content,
        pinned: draft.pinned,
        favorite: draft.favorite,
        createdAt: now,
        updatedAt: now,
      };
      saved = created;
      updateStore((prev) => ({
        ...prev,
        snippets: [...prev.snippets, created],
        customCategories: nextCustom,
      }));
      setSelectedId(created.id);
      toast.success("Snippet ditambahkan");
    } else if (editingId) {
      saved = {
        id: editingId,
        title,
        category,
        content,
        pinned: draft.pinned,
        favorite: draft.favorite,
        createdAt:
          snippets.find((s) => s.id === editingId)?.createdAt ?? now,
        updatedAt: now,
      };
      updateStore((prev) => ({
        ...prev,
        snippets: prev.snippets.map((s) =>
          s.id === editingId ? saved! : s,
        ),
        customCategories: nextCustom,
      }));
      toast.success("Snippet disimpan");
    }

    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    return saved;
  }, [draft, editingId, store?.customCategories, updateStore, snippets]);

  const addCustomCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateStore((prev) => {
        if (prev.customCategories.includes(trimmed)) return prev;
        return {
          ...prev,
          customCategories: [...prev.customCategories, trimmed],
        };
      });
    },
    [updateStore],
  );

  return {
    ready: store !== null,
    snippets,
    categories,
    filtered,
    search,
    setSearch,
    filter,
    setFilter,
    selected,
    selectedId,
    setSelectedId,
    editingId,
    draft,
    setDraft,
    previewText,
    copyPulseId,
    copySnippet,
    toggleFavorite,
    togglePinned,
    deleteSnippet,
    startCreate,
    startEdit,
    cancelEdit,
    saveDraft,
    addCustomCategory,
    recentCount: store?.recentIds.length ?? 0,
  };
}
