import type { SignatureDraft } from "./types";

const STORAGE_KEY = "frans-hub-signature-draft-v1";

export function loadDraft(): SignatureDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignatureDraft;
    if (parsed.version !== 1 || !Array.isArray(parsed.strokes)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Omit<SignatureDraft, "version" | "savedAt">) {
  if (typeof window === "undefined") return;
  const payload: SignatureDraft = {
    version: 1,
    ...draft,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
