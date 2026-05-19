import { parseLinesToDrafts } from "./utils";
import type { ParsedTransactionDraft } from "@/lib/finance/import/types";

export function parseGenericText(text: string): ParsedTransactionDraft[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 4);

  return parseLinesToDrafts(lines);
}
