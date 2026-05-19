import type { FinanceTransactionType } from "@/lib/finance/types";
import type { ParsedTransactionDraft } from "@/lib/finance/import/types";

const AMOUNT_RE =
  /(?:Rp\.?\s*|IDR\s*)?(-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|-?\d+(?:[.,]\d{2})?)/i;

const DATE_PATTERNS: { re: RegExp; parse: (m: RegExpMatchArray) => string | null }[] = [
  {
    re: /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,
    parse: (m) => {
      const d = m[1].padStart(2, "0");
      const mo = m[2].padStart(2, "0");
      return `${m[3]}-${mo}-${d}`;
    },
  },
  {
    re: /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,
    parse: (m) => {
      const mo = m[2].padStart(2, "0");
      const d = m[3].padStart(2, "0");
      return `${m[1]}-${mo}-${d}`;
    },
  },
];

export function parseAmount(raw: string): number | null {
  const m = raw.match(AMOUNT_RE);
  if (!m) return null;
  let s = m[1].replace(/\s/g, "");
  const negative = s.startsWith("-");
  s = s.replace(/^-/, "");
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    const parts = s.split(",");
    if (parts[1]?.length === 2) s = parts.join(".");
    else s = s.replace(/,/g, "");
  } else {
    s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return negative ? n : n;
}

export function parseDateFromLine(line: string): string | null {
  for (const { re, parse } of DATE_PATTERNS) {
    const m = line.match(re);
    if (m) {
      const iso = parse(m);
      if (iso && !Number.isNaN(Date.parse(iso))) return iso;
    }
  }
  return null;
}

export function inferType(line: string, amount: number): FinanceTransactionType {
  const u = line.toUpperCase();
  if (
    /TERIMA|MENERIMA|TOP\s*UP|TOPUP|MASUK|CREDIT|REFUND|PAYROLL|SALARY|GAJI/.test(u)
  ) {
    return "income";
  }
  if (/KELUAR|DEBIT|BAYAR|PAYMENT|PEMBELIAN|WITHDRAW|PENARIKAN/.test(u)) {
    return "expense";
  }
  return amount > 0 ? "expense" : "expense";
}

export function cleanMerchant(line: string, amountRaw: string): string {
  let s = line
    .replace(amountRaw, "")
    .replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length > 80) s = s.slice(0, 80);
  return s || "Transaction";
}

/** Prefer GoPay txn id so multi-page imports are not collapsed by wrong dates */
export function txnIdFromDraft(row: ParsedTransactionDraft): string | undefined {
  const head = row.rawLine?.split("|")[0]?.trim();
  if (head && /^(RB-\d+-\d+|F-\d+)$/i.test(head)) return head.toUpperCase();
  const m = row.rawLine?.match(/\b(RB-\d+-\d+|F-\d+)\b/i);
  return m?.[1]?.toUpperCase();
}

export function dedupeDrafts(rows: ParsedTransactionDraft[]): ParsedTransactionDraft[] {
  const byTxnId = new Map<string, ParsedTransactionDraft>();
  const noId: ParsedTransactionDraft[] = [];

  for (const r of rows) {
    const tid = txnIdFromDraft(r);
    if (tid) {
      byTxnId.set(tid, r);
    } else {
      noId.push(r);
    }
  }

  const seen = new Set<string>();
  const out: ParsedTransactionDraft[] = [...byTxnId.values()];

  for (const r of noId) {
    const key = `${r.transactionDate}|${r.amount}|${r.merchant.slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }

  return out.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
}

export function parseLinesToDrafts(lines: string[]): ParsedTransactionDraft[] {
  const rows: ParsedTransactionDraft[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 8) continue;
    const amount = parseAmount(trimmed);
    if (!amount || amount < 100) continue;
    const date =
      parseDateFromLine(trimmed) ??
      parseDateFromLine(lines[lines.indexOf(line) - 1] ?? "") ??
      new Date().toISOString().slice(0, 10);
    const amountMatch = trimmed.match(AMOUNT_RE)?.[0] ?? String(amount);
    const merchant = cleanMerchant(trimmed, amountMatch);
    const type = inferType(trimmed, amount);
    rows.push({
      title: merchant,
      merchant,
      amount,
      transactionDate: date,
      type,
      rawLine: trimmed,
    });
  }
  return dedupeDrafts(rows);
}
