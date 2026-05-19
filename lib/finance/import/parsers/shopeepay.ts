import { dedupeDrafts, parseLinesToDrafts } from "./utils";
import type { ParsedTransactionDraft } from "@/lib/finance/import/types";

export function parseShopeepayText(text: string): ParsedTransactionDraft[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows = parseLinesToDrafts(
    lines.filter(
      (l) =>
        /Rp|IDR|shopee|payment|pembayaran/i.test(l) &&
        !/total saldo|balance/i.test(l),
    ),
  );

  return dedupeDrafts(rows);
}
