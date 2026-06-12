export type CsvSourceType = "Reviewer" | "Auditor" | "Mixed" | "Other";

export type TimelineEventType =
  | "bug"
  | "priority_change"
  | "training"
  | "downtime"
  | "policy_update"
  | "other";

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  durationMinutes?: number;
  createdAt: string;
}

export type TrendMetricKey =
  | "totalReviews"
  | "averageReviews"
  | "averageMedianPace"
  | "totalHours"
  | "averageHours"
  | "uniqueEmails"
  | "belowThresholdCount"
  | "zeroReviewCount";

export interface DailyStats {
  date: string;
  totalReviews: number;
  averageReviews: number;
  averageMedianPaceSeconds?: number;
  highestMedianPaceSeconds?: number;
  lowestMedianPaceSeconds?: number;
  totalHours?: number;
  averageHours?: number;
  uniqueEmails: number;
  belowThresholdCount: number;
  zeroReviewCount: number;
  events: TimelineEvent[];
}

export const TREND_METRIC_LABELS: Record<TrendMetricKey, string> = {
  totalReviews: "Total reviews",
  averageReviews: "Average reviews",
  averageMedianPace: "Average median pace",
  totalHours: "Total hours",
  averageHours: "Average hours",
  uniqueEmails: "Unique emails",
  belowThresholdCount: "Below threshold count",
  zeroReviewCount: "Zero review count",
};

export const DEFAULT_TREND_METRICS: TrendMetricKey[] = [
  "totalReviews",
  "averageMedianPace",
];

export const PACE_METRICS = new Set<TrendMetricKey>(["averageMedianPace"]);

export const TIMELINE_EVENT_LABELS: Record<TimelineEventType, string> = {
  bug: "Bug / Issue",
  priority_change: "Priority Change",
  training: "Training Session",
  downtime: "System Downtime",
  policy_update: "Policy Update",
  other: "Other",
};
