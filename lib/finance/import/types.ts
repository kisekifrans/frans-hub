import type { FinanceTransactionType, ImportSource } from "@/lib/finance/types";

export interface ParsedTransactionDraft {
  title: string;
  merchant: string;
  amount: number;
  transactionDate: string;
  type: FinanceTransactionType;
  service?: string;
  paymentMethodLabel?: string;
  rawLine?: string;
}

export interface ImportParseResult {
  source: ImportSource;
  transactions: ParsedTransactionDraft[];
  errors: string[];
}

export interface ImportPreviewRow extends ParsedTransactionDraft {
  id: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  periodId?: string;
  periodName?: string;
  paymentMethodId?: string;
  paymentMethodName?: string;
}
