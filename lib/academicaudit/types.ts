export type RiskLevel = "low" | "medium" | "high";

export interface ParagraphAnalysis {
  index: number;
  text: string;
  score: number;
  level: RiskLevel;
  reason: string;
}

export interface AnalysisSummary {
  paragraph_count: number;
  average_score: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  language: string;
}

export interface AuditResponse {
  session_id: string;
  filename: string;
  summary: AnalysisSummary;
  paragraphs: ParagraphAnalysis[];
  truncated: boolean;
  disclaimer: string;
}

export type AuditPhase =
  | "idle"
  | "uploading"
  | "analyzing"
  | "done"
  | "error";
