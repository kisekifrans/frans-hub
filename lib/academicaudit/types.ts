export type PatternLevel = "natural" | "ringan" | "sedang" | "kuat";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface ExclusionOptions {
  excludeToc: boolean;
  excludeBibliography: boolean;
  excludeAppendix: boolean;
  excludeCaptions: boolean;
  excludePages: string;
}

export const defaultExclusionOptions: ExclusionOptions = {
  excludeToc: false,
  excludeBibliography: false,
  excludeAppendix: false,
  excludeCaptions: false,
  excludePages: "",
};

export interface ExcludedSection {
  label: string;
  count: number;
  detail: string;
}

export interface ParagraphAnalysis {
  index: number;
  text: string;
  score: number;
  level: PatternLevel;
  confidence: ConfidenceLevel;
  reason: string;
}

export interface AnalysisSummary {
  paragraph_count: number;
  page_count: number;
  average_score: number;
  natural_count: number;
  ringan_count: number;
  sedang_count: number;
  kuat_count: number;
  language: string;
  interpretation?: string;
  excluded_sections?: ExcludedSection[];
}

export interface AuditResponse {
  session_id: string;
  filename: string;
  report_filename: string;
  summary: AnalysisSummary;
  paragraphs: ParagraphAnalysis[];
  truncated: boolean;
  disclaimer: string;
  exclusions_applied?: ExclusionOptions;
}

export type AuditPhase =
  | "idle"
  | "uploading"
  | "analyzing"
  | "done"
  | "error";
