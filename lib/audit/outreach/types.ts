export interface OutreachColumnMap {
  email?: string;
  role?: string;
  reviews?: string;
  medianPace?: string;
  hours?: string;
}

export interface OutreachRecord {
  id: string;
  email: string;
  role: string;
  date: string;
  reviews: number;
  medianPace: string;
  hours: string;
  raw: Record<string, string>;
}

export type TemplateRuleKind = "default" | "lt" | "gt";

export interface OutreachTemplateRule {
  id: string;
  label: string;
  kind: TemplateRuleKind;
  /** Used when kind is lt or gt */
  threshold: number;
  body: string;
}

export interface OutreachSettings {
  lowThreshold: number;
  highThreshold: number;
  /** Apply template when reviews < lowThreshold */
  lowRuleEnabled: boolean;
  /** Apply template when reviews > highThreshold */
  highRuleEnabled: boolean;
  /** Skip rows where Reviews === 0 */
  ignoreZeroReviews: boolean;
  rules: OutreachTemplateRule[];
}

export interface GeneratedOutreachMessage {
  record: OutreachRecord;
  ruleId: string;
  ruleLabel: string;
  message: string;
}
