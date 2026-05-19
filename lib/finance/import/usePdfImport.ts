"use client";

import { useCallback } from "react";
import { extractPdfText } from "@/lib/finance/import/extract-pdf";
import { FINANCE_PDF_MAX_BYTES } from "@/lib/finance/import/constants";
import { parseStatementText } from "@/lib/finance/import/parse-text";
import { buildPreviewRows } from "@/lib/finance/import/build-preview";
import type { ImportPreviewRow } from "@/lib/finance/import/types";
import type {
  FinanceBudgetPeriod,
  FinanceCategory,
  FinancePaymentMethod,
  ImportSource,
} from "@/lib/finance/types";

export function usePdfImport() {
  const validateFile = useCallback((file: File): string | null => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are accepted";
    }
    if (file.size > FINANCE_PDF_MAX_BYTES) {
      return "Max file size is 25MB";
    }
    return null;
  }, []);

  const extractAndParse = useCallback(
    async (
      file: File,
      source: ImportSource,
      categories: FinanceCategory[],
      paymentMethods: FinancePaymentMethod[],
      periods: FinanceBudgetPeriod[] = [],
    ): Promise<{
      rows: ImportPreviewRow[];
      errors: string[];
      rawTextLength: number;
    }> => {
      const err = validateFile(file);
      if (err) return { rows: [], errors: [err], rawTextLength: 0 };

      let text: string;
      try {
        text = await extractPdfText(file);
      } catch (e) {
        console.error("[finance-import] pdf extract failed", e);
        return {
          rows: [],
          errors: ["Failed to read PDF. The file may be corrupted or scanned."],
          rawTextLength: 0,
        };
      }

      console.log("[finance-import] extracted chars", text.length);
      const parsed = parseStatementText(text, source);
      const rows = buildPreviewRows(
        parsed.transactions,
        source,
        categories,
        paymentMethods,
        periods,
      );

      return {
        rows,
        errors: parsed.errors,
        rawTextLength: text.length,
      };
    },
    [validateFile],
  );

  return { validateFile, extractAndParse, ready: true };
}
