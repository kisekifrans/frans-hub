/** Future PDF import pipeline — parser not implemented yet. */
export type { ImportSource, ImportJobStatus, FinanceImportJob } from "@/lib/finance/types";

export interface ParsedTransactionDraft {
  title: string;
  amount: number;
  transactionDate: string;
  type: "income" | "expense";
  rawLine?: string;
}

export interface ImportParseResult {
  source: import("@/lib/finance/types").ImportSource;
  transactions: ParsedTransactionDraft[];
  errors: string[];
}
