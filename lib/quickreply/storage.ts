import { createDefaultStore } from "./defaults";
import type { QuickReplyStore } from "./types";

export const STORAGE_KEY = "agisna-quickreply-v1";

export function loadStore(): QuickReplyStore {
  if (typeof window === "undefined") return createDefaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultStore();
      persistStore(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as QuickReplyStore;
    if (parsed.version !== 1 || !Array.isArray(parsed.snippets)) {
      const initial = createDefaultStore();
      persistStore(initial);
      return initial;
    }
    return {
      version: 1,
      snippets: parsed.snippets,
      customCategories: parsed.customCategories ?? [],
      recentIds: parsed.recentIds ?? [],
    };
  } catch {
    const initial = createDefaultStore();
    persistStore(initial);
    return initial;
  }
}

export function persistStore(store: QuickReplyStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function newSnippetId(): string {
  return `qr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
