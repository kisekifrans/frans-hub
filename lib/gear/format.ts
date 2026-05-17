/** Format optional manual price for display. Returns null when hidden. */
export function formatGearPrice(
  price: number | null | undefined,
  currency = "IDR",
): string | null {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.length === 3 ? currency : "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

export function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "category";
}
