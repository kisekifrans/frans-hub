/**
 * Placeholder hook for future PDF → transaction parsing.
 * Wire OCR/parser here without changing UI consumers.
 */
import { useCallback } from "react";
import type { ImportSource } from "@/lib/finance/types";
import type { ImportParseResult } from "@/lib/finance/import/types";

export function usePdfImport() {
  const parsePdf = useCallback(
    async (_file: File, _source: ImportSource): Promise<ImportParseResult> => {
      return {
        source: _source,
        transactions: [],
        errors: ["PDF parser not implemented yet."],
      };
    },
    [],
  );

  return { parsePdf, ready: false };
}
