import type { BrushStyle } from "./types";

type FreehandOptions = {
  size?: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  simulatePressure?: boolean;
  easing?: (t: number) => number;
  start?: { taper?: number | boolean; cap?: boolean };
  end?: { taper?: number | boolean; cap?: boolean };
};

export const PRESET_COLORS = [
  { id: "black", label: "Black", value: "#0f0f12" },
  { id: "navy", label: "Dark blue", value: "#1e3a5f" },
  { id: "royal", label: "Royal blue", value: "#1d4ed8" },
] as const;

export function getFreehandOptions(
  brushStyle: BrushStyle,
  size: number,
): Partial<FreehandOptions> {
  const base = {
    size: size * 4,
    thinning: 0.62,
    smoothing: 0.62,
    streamline: 0.48,
    simulatePressure: true,
    easing: (t: number) => t,
    start: { taper: 4, cap: true },
    end: { taper: 6, cap: true },
  };

  switch (brushStyle) {
    case "marker":
      return {
        ...base,
        size: size * 5.2,
        thinning: 0.15,
        smoothing: 0.55,
        streamline: 0.55,
        start: { taper: 0, cap: true },
        end: { taper: 0, cap: true },
      };
    case "fountain":
      return {
        ...base,
        size: size * 4.5,
        thinning: 0.85,
        smoothing: 0.7,
        streamline: 0.35,
        start: { taper: 8, cap: true },
        end: { taper: 12, cap: true },
      };
    case "sharp":
      return {
        ...base,
        size: size * 3.2,
        thinning: 0.92,
        smoothing: 0.15,
        streamline: 0.2,
        start: { taper: 0, cap: false },
        end: { taper: 0, cap: false },
      };
    case "pen":
    default:
      return base;
  }
}
