export function formatMoney(
  amount: number,
  currency = "IDR",
  compact = false,
): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      notation: compact && Math.abs(n) >= 1_000_000 ? "compact" : "standard",
      maximumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.length === 3 ? currency : "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDateId(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso + "T12:00:00"));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso + "T12:00:00"));
}

export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
