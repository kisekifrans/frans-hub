export function parseHoursToNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-" || trimmed === "N/A") {
    return null;
  }

  const withH = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/i);
  if (withH) {
    const n = Number(withH[1]);
    return Number.isFinite(n) ? n : null;
  }

  const cleaned = trimmed.replace(/,/g, "");
  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

export function formatHoursDisplay(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded}h`;
}
