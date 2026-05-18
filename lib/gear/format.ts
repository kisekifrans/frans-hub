import { normalizeGearCurrency, normalizeGearPrice } from "@/lib/gear/price";

/** Format optional manual price for display. Returns null when hidden. */
export function formatGearPrice(
  price: number | null | undefined,
  currency = "IDR",
): string | null {
  const amount = normalizeGearPrice(price);
  if (amount == null) return null;
  const code = normalizeGearCurrency(currency);
  if (code === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code.length === 3 ? code : "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "category";
}
