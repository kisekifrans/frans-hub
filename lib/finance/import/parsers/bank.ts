import { dedupeDrafts, parseLinesToDrafts } from "./utils";
import type { ParsedTransactionDraft } from "@/lib/finance/import/types";

export function parseBankText(text: string): ParsedTransactionDraft[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates = lines.filter(
    (l) =>
      /Rp|IDR|DB|CR|DEBIT|KREDIT|\d{1,2}\/\d{1,2}\/\d{4}/i.test(l) &&
      !/saldo awal|saldo akhir|opening|closing|mutasi rekening/i.test(l),
  );

  return dedupeDrafts(parseLinesToDrafts(candidates));
}
