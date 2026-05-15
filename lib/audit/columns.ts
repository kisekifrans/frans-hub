import type { ColumnMap } from "./types";

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const ALIASES: Record<keyof ColumnMap, string[]> = {
  episodeId: ["episodeid", "epid", "episode", "contentid"],
  auditor: [
    "auditorname",
    "auditor",
    "auditoremail",
    "reviewer",
    "reviewername",
    "username",
    "assignedto",
    "qaanalyst",
  ],
  notes: [
    "rejectionnote",
    "rejectnote",
    "notes",
    "note",
    "comments",
    "auditornotes",
    "reviewernotes",
    "feedback",
  ],
  reviewerResult: [
    "humanqaresult",
    "reviewerresult",
    "result",
    "decision",
    "reviewresult",
    "auditresult",
    "verdict",
    "outcome",
  ],
  rejectionReason: [
    "rejectionreason",
    "rejectreason",
    "reason",
    "rejectedreason",
    "failreason",
  ],
  auditStatus: ["auditstatus", "status", "reviewstatus", "qastatus"],
};

export function detectColumnMap(headers: string[]): ColumnMap {
  const map: ColumnMap = {};
  const normalized = headers.map((h) => ({
    original: h,
    norm: normalizeKey(h),
  }));

  for (const [field, aliases] of Object.entries(ALIASES) as [
    keyof ColumnMap,
    string[],
  ][]) {
    const match = normalized.find((h) => aliases.includes(h.norm));
    if (match) map[field] = match.original;
  }

  return map;
}

export function getCell(
  row: Record<string, string>,
  header: string | undefined,
): string {
  if (!header) return "";
  if (header in row) return row[header] ?? "";
  const lower = header.toLowerCase();
  const key = Object.keys(row).find((k) => k.toLowerCase() === lower);
  return key ? (row[key] ?? "") : "";
}

export function isDiscrepancy(
  row: Record<string, string>,
  columnMap: ColumnMap,
  adminDecision: string | null,
): boolean {
  if (!adminDecision) return false;
  const reviewer = getCell(row, columnMap.reviewerResult).toLowerCase().trim();
  if (!reviewer) return false;
  const agreeSignals = ["approve", "approved", "pass", "accept", "agree", "yes"];
  const disagreeSignals = [
    "reject",
    "rejected",
    "fail",
    "failed",
    "disagree",
    "no",
    "deny",
  ];
  const reviewerAgree = agreeSignals.some((s) => reviewer.includes(s));
  const reviewerDisagree = disagreeSignals.some((s) => reviewer.includes(s));
  if (adminDecision === "agree" && reviewerDisagree) return true;
  if (adminDecision === "disagree" && reviewerAgree) return true;
  return false;
}
