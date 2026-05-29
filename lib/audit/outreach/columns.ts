import type { OutreachColumnMap } from "./types";

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const EMAIL_ALIASES = [
  "email",
  "useremail",
  "auditoremail",
  "workeremail",
  "qaemail",
  "mail",
];

const ROLE_ALIASES = ["role", "roles", "userrole", "position"];

const REVIEWS_ALIASES = [
  "reviews",
  "reviewcount",
  "reviewcounts",
  "count",
  "totalreviews",
  "episodes",
  "completions",
  "completed",
  "qty",
  "quantity",
];

const MEDIAN_PACE_ALIASES = [
  "medianpace",
  "medianpaces",
  "medianpaceperreview",
  "medianpaceseconds",
  "medianpacesinseconds",
  "pace",
];

const HOURS_ALIASES = ["hours", "hour", "totalhours", "workedhours", "timehours"];

export function detectOutreachColumnMap(headers: string[]): OutreachColumnMap {
  const map: OutreachColumnMap = {};
  const normalized = headers.map((h) => ({
    original: h,
    norm: normalizeKey(h),
  }));

  const pick = (aliases: string[]) =>
    normalized.find((h) => aliases.includes(h.norm))?.original;

  map.email = pick(EMAIL_ALIASES);
  map.role = pick(ROLE_ALIASES);
  map.reviews = pick(REVIEWS_ALIASES);
  map.medianPace =
    pick(MEDIAN_PACE_ALIASES) ??
    normalized.find(
      (h) => h.norm.includes("median") && h.norm.includes("pace"),
    )?.original;
  map.hours = pick(HOURS_ALIASES);

  return map;
}

export function getOutreachCell(
  row: Record<string, string>,
  header: string | undefined,
): string {
  if (!header) return "";
  if (header in row) return row[header] ?? "";
  const lower = header.toLowerCase();
  const key = Object.keys(row).find((k) => k.toLowerCase() === lower);
  return key ? (row[key] ?? "") : "";
}
