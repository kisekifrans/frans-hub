import type { ConfidenceLevel, PatternLevel } from "./types";

export const levelMeta: Record<
  PatternLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  kuat: {
    label: "Pola kuat",
    color: "text-rose-700/90 dark:text-rose-200",
    bg: "bg-rose-500/10",
    border: "border-rose-400/25",
  },
  sedang: {
    label: "Pola sedang",
    color: "text-amber-800/90 dark:text-amber-200",
    bg: "bg-amber-500/10",
    border: "border-amber-400/25",
  },
  ringan: {
    label: "Pola ringan",
    color: "text-yellow-800/80 dark:text-yellow-200",
    bg: "bg-yellow-500/10",
    border: "border-yellow-400/20",
  },
  natural: {
    label: "Cenderung natural",
    color: "text-emerald-800/90 dark:text-emerald-200",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/25",
  },
};

export const confidenceLabel: Record<ConfidenceLevel, string> = {
  low: "Keyakinan rendah",
  medium: "Keyakinan sedang",
  high: "Keyakinan tinggi",
};

export function formatScore(score: number): string {
  return `${Math.round(score)}`;
}
