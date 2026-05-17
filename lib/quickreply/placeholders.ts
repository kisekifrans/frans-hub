/** Reserved for future templating — not expanded in MVP. */
export const PLACEHOLDER_KEYS = ["name", "product", "price"] as const;

export type PlaceholderKey = (typeof PLACEHOLDER_KEYS)[number];

const PLACEHOLDER_RE = /\{(name|product|price)\}/gi;

export function hasPlaceholders(text: string): boolean {
  return PLACEHOLDER_RE.test(text);
}

/** MVP: returns text unchanged; later replace with runtime values. */
export function applyPlaceholders(
  text: string,
  _values?: Partial<Record<PlaceholderKey, string>>,
): string {
  return text;
}
