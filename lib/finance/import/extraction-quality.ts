import { countTxnIds, repairExtractedTxnIds } from "./parsers/txn-id-repair";

/** Full-month GoPay / Gojek statement expectations */
export const MIN_TXN_IDS_FOR_FULL_STATEMENT = 30;
export const MIN_LATEST_DATE_DAY = 17;

export interface ExtractionQuality {
  txnIdCount: number;
  rbTxnIdCount: number;
  fTxnIdCount: number;
  hasTransport: boolean;
  latestDateIso: string | null;
  expectedEndDateIso: string | null;
  passes: boolean;
  reasons: string[];
}

export function countRbTxnIds(text: string): number {
  const repaired = repairExtractedTxnIds(text);
  return (repaired.match(/RB-\d+-\d+/gi) ?? []).length;
}

export function countFTxnIds(text: string): number {
  const repaired = repairExtractedTxnIds(text);
  return (repaired.match(/F-\d{6,}/gi) ?? []).length;
}

/** GoFood-only pdf.js pass: many F- ids, zero RB- ride references */
export function looksFoodOnlyExtraction(text: string, txnIdCount: number): boolean {
  if (txnIdCount < 8) return false;
  const rb = countRbTxnIds(text);
  const f = countFTxnIds(text);
  return f >= 5 && rb === 0;
}

/** Riwayat_transaksi_Gojek_010526-190526.pdf → end 2026-05-19 */
export function parseFilenameDateRange(
  filename: string,
): { startIso?: string; endIso?: string } {
  const m = filename.match(/(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
  if (!m) return {};
  const iso = (dd: string, mm: string, yy: string) =>
    `20${yy}-${mm}-${dd}`;
  return {
    startIso: iso(m[1], m[2], m[3]),
    endIso: iso(m[4], m[5], m[6]),
  };
}

export function maxDateIsoFromText(text: string): string | null {
  const dates = [...text.matchAll(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g)];
  let max: string | null = null;
  for (const m of dates) {
    const iso = `${m[3]}-${m[2]}-${m[1]}`;
    if (!Number.isNaN(Date.parse(iso)) && (!max || iso > max)) max = iso;
  }
  return max;
}

/** Service in txn block or Gojek table row — not "Riwayat transaksi Gojek" header */
export function hasTransportService(text: string): boolean {
  const lines = text.split(/\n/);
  return lines.some((line) => {
    const t = line.trim();
    if (t.length < 3) return false;
    if (/riwayat\s+transaksi|periode\s+transaksi|download\s+bukti|halaman\s+\d/i.test(t)) {
      return false;
    }
    return /\b(GoCar(?:\s+Comfort)?|GoRide|Gojek)\b/i.test(t);
  });
}

/** Scale 30 txns / full month to shorter filename ranges (e.g. 19 days → ~19 min) */
export function minTxnIdsForFilename(filename?: string): number {
  const { startIso, endIso } = filename
    ? parseFilenameDateRange(filename)
    : {};
  if (startIso && endIso) {
    const start = Date.parse(startIso);
    const end = Date.parse(endIso);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1);
      return Math.max(8, Math.ceil((MIN_TXN_IDS_FOR_FULL_STATEMENT * days) / 31));
    }
  }
  return MIN_TXN_IDS_FOR_FULL_STATEMENT;
}

export function dateRangeStopsEarly(
  text: string,
  txnIdCount: number,
  expectedEndIso?: string,
): boolean {
  if (txnIdCount < 8) return false;
  const max = maxDateIsoFromText(text);
  if (!max) return false;

  if (expectedEndIso && max < expectedEndIso) {
    const maxDay = parseInt(max.slice(8, 10), 10);
    const endDay = parseInt(expectedEndIso.slice(8, 10), 10);
    if (endDay - maxDay <= 1) return false;
    return true;
  }

  const day = parseInt(max.slice(8, 10), 10);
  return day < MIN_LATEST_DATE_DAY;
}

export function assessExtractionQuality(
  text: string,
  filename?: string,
): ExtractionQuality {
  const repaired = repairExtractedTxnIds(text);
  const txnIdCount = countTxnIds(repaired);
  const rbTxnIdCount = countRbTxnIds(repaired);
  const fTxnIdCount = countFTxnIds(repaired);
  const hasTransport = hasTransportService(repaired);
  const latestDateIso = maxDateIsoFromText(repaired);
  const { endIso: expectedEndDateIso } = filename
    ? parseFilenameDateRange(filename)
    : {};

  const minTxnIds = minTxnIdsForFilename(filename);
  const reasons: string[] = [];
  if (txnIdCount < minTxnIds) {
    reasons.push(
      `only ${txnIdCount} transaction IDs (expected ${minTxnIds}+ for this period)`,
    );
  }
  if (looksFoodOnlyExtraction(repaired, txnIdCount)) {
    reasons.push(
      `only GoFood-style F- IDs (${fTxnIdCount} F-, 0 RB- ride references)`,
    );
  }
  if (!hasTransport) {
    reasons.push("no GoCar / GoRide transport service lines found");
  }
  if (dateRangeStopsEarly(repaired, txnIdCount, expectedEndDateIso)) {
    reasons.push(
      expectedEndDateIso
        ? `latest date ${latestDateIso ?? "?"} before PDF end ${expectedEndDateIso}`
        : `latest date ${latestDateIso ?? "?"} stops before day ${MIN_LATEST_DATE_DAY}`,
    );
  }

  return {
    txnIdCount,
    rbTxnIdCount,
    fTxnIdCount,
    hasTransport,
    latestDateIso,
    expectedEndDateIso: expectedEndDateIso ?? null,
    passes: reasons.length === 0,
    reasons,
  };
}
