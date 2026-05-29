import { parseHoursToNumber, formatHoursDisplay } from "./hours";
import {
  formatSecondsToPace,
  parseMedianPaceToSeconds,
} from "./pace";
import type { OutreachRecord } from "@/lib/audit/outreach/types";

export interface StatHighlight {
  value: string;
  email: string | null;
}

export function findHighestHours(records: OutreachRecord[]): StatHighlight {
  let best: { hours: number; email: string } | null = null;

  for (const r of records) {
    const h = parseHoursToNumber(r.hours);
    if (h == null) continue;
    if (!best || h > best.hours) {
      best = { hours: h, email: r.email };
    }
  }

  if (!best) return { value: "—", email: null };
  return {
    value: formatHoursDisplay(best.hours),
    email: best.email,
  };
}

export function findHighestMedianPace(records: OutreachRecord[]): StatHighlight {
  let best: { seconds: number; email: string } | null = null;

  for (const r of records) {
    const sec = parseMedianPaceToSeconds(r.medianPace);
    if (sec == null) continue;
    if (!best || sec > best.seconds) {
      best = { seconds: sec, email: r.email };
    }
  }

  if (!best) return { value: "—", email: null };
  return {
    value: formatSecondsToPace(best.seconds),
    email: best.email,
  };
}
