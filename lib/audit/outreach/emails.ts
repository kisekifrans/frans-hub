export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Parse pasted list from Sheets (newline, comma, tab, semicolon). */
export function parseEmailPaste(text: string): string[] {
  if (!text.trim()) return [];
  const parts = text
    .split(/[\n\r,;\t]+/)
    .map((p) => normalizeEmail(p))
    .filter((p) => p.includes("@"));
  return [...new Set(parts)];
}
