/** Parse median pace strings like "2m 9s", "18m 27s", or raw seconds. */
export function parseMedianPaceToSeconds(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return null;

  const minSec = trimmed.match(/^(\d+)\s*m\s*(\d+)\s*s?$/i);
  if (minSec) {
    return Number(minSec[1]) * 60 + Number(minSec[2]);
  }

  const minOnly = trimmed.match(/^(\d+)\s*m$/i);
  if (minOnly) return Number(minOnly[1]) * 60;

  const secOnly = trimmed.match(/^(\d+)\s*s$/i);
  if (secOnly) return Number(secOnly[1]);

  const digits = trimmed.replace(/,/g, "");
  if (/^\d+(\.\d+)?$/.test(digits)) {
    const n = Number(digits);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

export function formatSecondsToPace(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function averageMedianPaceLabel(values: string[]): string {
  const seconds = values
    .map(parseMedianPaceToSeconds)
    .filter((v): v is number => v != null);
  if (seconds.length === 0) return "—";
  const avg = seconds.reduce((a, b) => a + b, 0) / seconds.length;
  return formatSecondsToPace(avg);
}
