import type {
  GeneratedOutreachMessage,
  OutreachRecord,
  OutreachSettings,
  OutreachTemplateRule,
  TemplateRuleKind,
} from "./types";

const STORAGE_KEY = "frans-hub-qa-outreach-settings";

export const DEFAULT_LOW_TEMPLATE = `Hi there {{email}},

During {{date}} you only worked on {{reviews}} review(s) (median pace {{median_pace}}, {{hours}} logged). We want to know if you encountered any issues that day that resulted in very low completions.

Please send us any information or issues that slowed you down from completing episodes.

Thank you.`;

export const DEFAULT_DEFAULT_TEMPLATE = `Hi there {{email}},

During {{date}} you worked on {{reviews}} review(s). We'd like a quick update on how your shift went and whether anything blocked you from finishing episodes.

Please share any issues or slowdowns you noticed.

Thank you.`;

export const DEFAULT_HIGH_TEMPLATE = `Hi there {{email}},

During {{date}} you completed {{reviews}} review(s) — great volume. If anything still felt off (quality, tooling, or process), we'd love to hear so we can support the team.

Thank you.`;

export const DEFAULT_OUTREACH_SETTINGS: OutreachSettings = {
  lowThreshold: 3,
  highThreshold: 5,
  lowRuleEnabled: true,
  highRuleEnabled: true,
  ignoreZeroReviews: true,
  rules: [
    {
      id: "low",
      label: "Low volume (< threshold)",
      kind: "lt",
      threshold: 3,
      body: DEFAULT_LOW_TEMPLATE,
    },
    {
      id: "high",
      label: "High volume (> threshold)",
      kind: "gt",
      threshold: 5,
      body: DEFAULT_HIGH_TEMPLATE,
    },
    {
      id: "default",
      label: "Default (between thresholds)",
      kind: "default",
      threshold: 0,
      body: DEFAULT_DEFAULT_TEMPLATE,
    },
  ],
};

export function loadOutreachSettings(): OutreachSettings {
  if (typeof window === "undefined") return DEFAULT_OUTREACH_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OUTREACH_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<OutreachSettings>;
    const rules =
      parsed.rules?.length && Array.isArray(parsed.rules)
        ? parsed.rules.map((r) => ({
            id: r.id ?? crypto.randomUUID(),
            label: r.label ?? "Rule",
            kind: (r.kind ?? "default") as TemplateRuleKind,
            threshold: Number(r.threshold) || 0,
            body: r.body ?? "",
          }))
        : DEFAULT_OUTREACH_SETTINGS.rules;

    return {
      lowThreshold: parsed.lowThreshold ?? DEFAULT_OUTREACH_SETTINGS.lowThreshold,
      highThreshold:
        parsed.highThreshold ?? DEFAULT_OUTREACH_SETTINGS.highThreshold,
      ignoreZeroReviews:
        parsed.ignoreZeroReviews ?? DEFAULT_OUTREACH_SETTINGS.ignoreZeroReviews,
      lowRuleEnabled:
        parsed.lowRuleEnabled ?? DEFAULT_OUTREACH_SETTINGS.lowRuleEnabled,
      highRuleEnabled:
        parsed.highRuleEnabled ?? DEFAULT_OUTREACH_SETTINGS.highRuleEnabled,
      rules: syncRuleThresholds(rules, {
        low: parsed.lowThreshold ?? DEFAULT_OUTREACH_SETTINGS.lowThreshold,
        high: parsed.highThreshold ?? DEFAULT_OUTREACH_SETTINGS.highThreshold,
      }),
    };
  } catch {
    return DEFAULT_OUTREACH_SETTINGS;
  }
}

function syncRuleThresholds(
  rules: OutreachTemplateRule[],
  thresholds: { low: number; high: number },
): OutreachTemplateRule[] {
  return rules.map((r) => {
    if (r.kind === "lt") return { ...r, threshold: thresholds.low };
    if (r.kind === "gt") return { ...r, threshold: thresholds.high };
    return r;
  });
}

export function saveOutreachSettings(settings: OutreachSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function renderOutreachTemplate(
  body: string,
  record: OutreachRecord,
): string {
  const reviewsWord =
    record.reviews === 1 ? "1 review" : `${record.reviews} reviews`;
  return body
    .replace(/\{\{\s*email\s*\}\}/gi, record.email)
    .replace(/\{\{\s*role\s*\}\}/gi, record.role || "—")
    .replace(/\{\{\s*roles\s*\}\}/gi, record.role || "—")
    .replace(/\{\{\s*date\s*\}\}/gi, record.date)
    .replace(/\{\{\s*reviews\s*\}\}/gi, String(record.reviews))
    .replace(/\{\{\s*reviews_label\s*\}\}/gi, reviewsWord)
    .replace(/\{\{\s*median_pace\s*\}\}/gi, record.medianPace || "—")
    .replace(/\{\{\s*medianpace\s*\}\}/gi, record.medianPace || "—")
    .replace(/\{\{\s*hours\s*\}\}/gi, record.hours || "—");
}

export function pickTemplateRule(
  reviews: number,
  settings: OutreachSettings,
): OutreachTemplateRule {
  const {
    lowThreshold,
    highThreshold,
    lowRuleEnabled,
    highRuleEnabled,
    rules,
  } = settings;
  const low = rules.find((r) => r.kind === "lt");
  const high = rules.find((r) => r.kind === "gt");
  const fallback =
    rules.find((r) => r.kind === "default") ?? DEFAULT_OUTREACH_SETTINGS.rules[2];

  if (lowRuleEnabled && reviews < lowThreshold && low) return low;
  if (highRuleEnabled && reviews > highThreshold && high) return high;
  return fallback;
}

export function generateOutreachMessages(
  records: OutreachRecord[],
  settings: OutreachSettings,
): GeneratedOutreachMessage[] {
  return records.map((record) => {
    const rule = pickTemplateRule(record.reviews, settings);
    return {
      record,
      ruleId: rule.id,
      ruleLabel: rule.label,
      message: renderOutreachTemplate(rule.body, record),
    };
  });
}
