import type { RiskLevel } from "./types";

export const levelMeta: Record<
  RiskLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  high: {
    label: "Tinggi",
    color: "text-rose-600 dark:text-rose-300",
    bg: "bg-rose-500/15",
    border: "border-rose-400/40",
  },
  medium: {
    label: "Sedang",
    color: "text-amber-600 dark:text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-400/40",
  },
  low: {
    label: "Rendah",
    color: "text-emerald-600 dark:text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-400/40",
  },
};

export function formatPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}
