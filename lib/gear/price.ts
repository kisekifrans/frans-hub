/** Normalize DB/JSON price values for GearItem. */
export function normalizeGearPrice(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Parse admin price input (number field or pasted text). */
export function parseGearPriceInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return normalizeGearPrice(Number(trimmed));
  }

  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  if (!digitsOnly) return null;
  return normalizeGearPrice(Number(digitsOnly));
}

export function normalizeGearCurrency(value: unknown): string {
  if (typeof value !== "string") return "IDR";
  const code = value.trim().toUpperCase();
  return code.length >= 3 ? code.slice(0, 3) : "IDR";
}
