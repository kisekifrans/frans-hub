import { averageMedianPaceLabel } from "./pace";
import type { OutreachRecord } from "@/lib/audit/outreach/types";

export interface ReviewStatsSummary {
  totalRows: number;
  activeRows: number;
  ignoredZeroRows: number;
  avgReviews: number;
  avgMedianPace: string;
  totalReviews: number;
}

export function computeReviewStats(
  records: OutreachRecord[],
  opts: { ignoreZeroReviews: boolean },
): ReviewStatsSummary {
  const totalRows = records.length;
  const active = opts.ignoreZeroReviews
    ? records.filter((r) => r.reviews > 0)
    : records;
  const ignoredZeroRows = opts.ignoreZeroReviews
    ? records.filter((r) => r.reviews === 0).length
    : 0;

  if (active.length === 0) {
    return {
      totalRows,
      activeRows: 0,
      ignoredZeroRows,
      avgReviews: 0,
      avgMedianPace: "—",
      totalReviews: 0,
    };
  }

  const totalReviews = active.reduce((sum, r) => sum + r.reviews, 0);
  const avgReviews =
    Math.round((totalReviews / active.length) * 100) / 100;

  return {
    totalRows,
    activeRows: active.length,
    ignoredZeroRows,
    avgReviews,
    avgMedianPace: averageMedianPaceLabel(active.map((r) => r.medianPace)),
    totalReviews,
  };
}

export function filterByReviewsBelow(
  records: OutreachRecord[],
  threshold: number,
  opts: { ignoreZeroReviews: boolean },
): OutreachRecord[] {
  const pool = opts.ignoreZeroReviews
    ? records.filter((r) => r.reviews > 0)
    : records;
  return pool.filter((r) => r.reviews < threshold);
}
