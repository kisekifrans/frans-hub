import {
  dedupeDrafts,
  inferType,
  parseDateFromLine,
} from "./utils";
import { repairExtractedTxnIds } from "./txn-id-repair";
import type { ParsedTransactionDraft } from "@/lib/finance/import/types";

/** Block anchors — F- needs 6+ digits to avoid page-number false positives */
const TXN_ID_RE = /(RB-\d+-\d+|F-\d{6,})/gi;
const TXN_ID_ONLY = /^(RB-\d+-\d+|F-\d{6,})$/i;

const DATE_ONLY_LINE = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/;
const AMOUNT_LINE = /^Rp\s?[\d.]+$/i;

const PAYMENT_METHODS = [
  "GoPayLater",
  "GoPay Coins",
  "GoPay",
] as const;

const SERVICES = [
  "GoCar Comfort",
  "GoCar",
  "GoFood",
  "GoRide",
  "GoSend",
  "Gojek",
] as const;

const HEADER_LINE =
  /periode\s+transaksi|total\s+transaksi|plus\s+bantu\s+kamu|bukti\s+satuan|nama\s+user|nama\s*:|email\s*:|phone\s*:|no\.\s*hp|saldo\s+awal|saldo\s+akhir|ringkasan\s+transaksi|download\s+bukti|mutasi\s+gopay|halaman\s+\d+\s+dari/i;

const TIME_LINE = /^\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?$/i;

function isSkippableLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 2) return true;
  if (HEADER_LINE.test(t)) return true;
  if (/^periode$/i.test(t)) return true;
  if (TIME_LINE.test(t)) return true;
  if (/^page\s+\d+/i.test(t)) return true;
  if (/^-$/.test(t)) return true;
  return false;
}

function allTxnIdMatches(text: string): RegExpMatchArray[] {
  return [...text.matchAll(new RegExp(TXN_ID_RE.source, "gi"))];
}

function parseGopayAmount(raw: string): number | null {
  const m = raw.match(/Rp\s?([\d.]+)/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/\./g, ""), 10);
  if (!Number.isFinite(n) || n < 100) return null;
  return n;
}

function matchPaymentMethod(line: string): string | undefined {
  const t = line.trim();
  for (const p of PAYMENT_METHODS) {
    if (t.toLowerCase() === p.toLowerCase()) return p;
  }
  return undefined;
}

function matchService(line: string): string | undefined {
  const t = line.trim();
  for (const s of SERVICES) {
    if (t.toLowerCase() === s.toLowerCase()) return s;
    if (t.toLowerCase().startsWith(s.toLowerCase() + " ")) return s;
    if (new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(t)) {
      return s;
    }
  }
  return undefined;
}

const SERVICE_PREFIX_RE =
  /^(?:GoCar Comfort|GoCar|GoRide|GoFood|GoSend|Gojek|GrabCar|GrabBike|GrabFood|ShopeeFood|Grab)\s+/i;

export function stripServicePrefix(
  merchant: string,
  service?: string,
): string {
  let name = merchant.trim();
  if (!name) return merchant;

  if (service) {
    const escaped = service.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    name = name.replace(new RegExp(`^${escaped}\\s+`, "i"), "");
  }
  name = name.replace(SERVICE_PREFIX_RE, "");
  return name.trim() || merchant.trim();
}

export function cleanGopayMerchant(
  service: string | undefined,
  lines: string[],
): string {
  const joined = lines.join(" ").trim();

  if (service === "GoFood" || /^GoFood\b/i.test(joined)) {
    const m = joined.match(/GoFood\s+(.+)/i);
    if (m) {
      const name = m[1]
        .replace(/\([^)]*\)/g, "")
        .split(",")[0]
        .trim();
      const brand = name.split(/\s+/).slice(0, 3).join(" ");
      return stripServicePrefix(brand || "GoFood", service);
    }
  }

  if (
    service === "GoCar" ||
    service === "GoCar Comfort" ||
    service === "GoRide" ||
    service === "Gojek"
  ) {
    for (const l of lines) {
      const inline = l
        .replace(/^\d{1,2}\/\d{1,2}\/\d{4}\s+/, "")
        .replace(/\b(?:RB-\d+-\d+|F-\d{6,})\s*/i, "")
        .match(/\b(GoCar(?:\s+Comfort)?|GoRide|Gojek)\s+(.+)/i);
      if (inline?.[2]) {
        const name = inline[2].replace(/\s+Comfort\s*$/i, "").trim();
        if (name.length > 1) return stripServicePrefix(name, service);
      }
    }
    const location = lines.find(
      (l) =>
        !TXN_ID_ONLY.test(l) &&
        !DATE_ONLY_LINE.test(l) &&
        !AMOUNT_LINE.test(l) &&
        !matchPaymentMethod(l) &&
        !matchService(l) &&
        !isSkippableLine(l) &&
        !/^Go(Car|Ride|jek|Food|Send)\b/i.test(l),
    );
    if (location) return stripServicePrefix(location.trim(), service);
    const fromJoined = stripServicePrefix(joined, service);
    if (fromJoined && fromJoined.toLowerCase() !== service?.toLowerCase()) {
      return fromJoined;
    }
    return service ?? "Transport";
  }

  const merchantLine = lines.find(
    (l) =>
      !TXN_ID_ONLY.test(l) &&
      !DATE_ONLY_LINE.test(l) &&
      !AMOUNT_LINE.test(l) &&
      !matchPaymentMethod(l) &&
      !matchService(l) &&
      !isSkippableLine(l) &&
      !/^GoFood\b/i.test(l),
  );
  if (merchantLine) {
    const cleaned = merchantLine
      .replace(/^GoFood\s+/i, "")
      .replace(/\([^)]*\)/g, "")
      .split(",")[0]
      .trim()
      .slice(0, 80);
    return stripServicePrefix(cleaned, service);
  }

  const fallback =
    service ?? lines.find((l) => !isSkippableLine(l) && !TXN_ID_ONLY.test(l));
  return stripServicePrefix(fallback ?? "GoPay transaction", service);
}

function isHeaderMerchant(merchant: string): boolean {
  return HEADER_LINE.test(merchant) || /^periode$/i.test(merchant.trim());
}

/** Per-block line split only — never rewrite the whole document */
function segmentToLines(segment: string): string[] {
  return segment
    .replace(/\s*(Rp\s?[\d.]+)/gi, "\n$1\n")
    .replace(/\s*(\d{2}\/\d{2}\/\d{4})\s*/g, "\n$1\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isSkippableLine(l));
}

function findDateBeforeIndex(text: string, idStart: number): string | null {
  const scanStart = Math.max(0, idStart - 800);
  const chunk = text.slice(scanStart, idStart);
  const dates = [...chunk.matchAll(/\b(\d{2}\/\d{2}\/\d{4})\b/g)];
  if (dates.length === 0) return null;
  return parseDateFromLine(dates[dates.length - 1][1]);
}

function findAmountInBlock(contentLines: string[]): number | null {
  let lastPaymentIdx = -1;
  for (let i = 0; i < contentLines.length; i++) {
    if (matchPaymentMethod(contentLines[i])) lastPaymentIdx = i;
  }

  if (lastPaymentIdx >= 0) {
    for (let i = lastPaymentIdx + 1; i < contentLines.length; i++) {
      const line = contentLines[i];
      if (TXN_ID_ONLY.test(line) || DATE_ONLY_LINE.test(line)) break;
      const inline = line.match(/Rp\s?[\d.]+/i);
      if (inline) {
        const a = parseGopayAmount(inline[0]);
        if (a) return a;
      }
    }
  }

  let last: number | null = null;
  for (const line of contentLines) {
    if (isSkippableLine(line) || /total\s+transaksi/i.test(line)) continue;
    const inline = line.match(/Rp\s?[\d.]+/i);
    if (inline) {
      const a = parseGopayAmount(inline[0]);
      if (a && a < 50_000_000) last = a;
    }
  }
  return last;
}

type TxnBlock = {
  txnId: string;
  lines: string[];
  dateHint: string | null;
};

function splitBlocksByTxnId(fullText: string): TxnBlock[] {
  const matches = allTxnIdMatches(fullText);
  if (matches.length === 0) return [];

  const blocks: TxnBlock[] = [];

  for (let i = 0; i < matches.length; i++) {
    const txnId = matches[i][1];
    const idStart = matches[i].index ?? 0;
    const nextStart =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? fullText.length)
        : fullText.length;

    const segment = fullText.slice(idStart, nextStart);
    const lines = segmentToLines(segment);

    blocks.push({
      txnId,
      lines,
      dateHint: findDateBeforeIndex(fullText, idStart),
    });
  }

  return blocks;
}

function contentLinesForBlock(txnId: string, lines: string[]): string[] {
  if (lines.length === 0) return [];

  const first = lines[0];
  const idRe = new RegExp(
    `^${txnId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\b|\\s|$)`,
    "i",
  );
  if (idRe.test(first)) {
    const rest = first.replace(idRe, "").trim();
    return rest ? [rest, ...lines.slice(1)] : lines.slice(1);
  }

  const txnIdx = lines.findIndex((l) =>
    l.toUpperCase().startsWith(txnId.toUpperCase()),
  );
  if (txnIdx >= 0) {
    const line = lines[txnIdx];
    const rest = line.slice(txnId.length).trim();
    return rest
      ? [rest, ...lines.slice(txnIdx + 1)]
      : lines.slice(txnIdx + 1);
  }

  return lines.filter((l) => !TXN_ID_ONLY.test(l));
}

function parseBlock(
  txnId: string,
  lines: string[],
  carryDate: string,
  dateHint: string | null,
): ParsedTransactionDraft | null {
  const contentLines = contentLinesForBlock(txnId, lines);
  const amount = findAmountInBlock(contentLines);
  if (!amount) return null;

  let blockDate = dateHint ?? carryDate;
  if (!dateHint) {
    for (const line of contentLines) {
      const d = parseDateFromLine(line);
      if (d) {
        blockDate = d;
        break;
      }
    }
  }

  let service: string | undefined;
  let paymentMethod: string | undefined;
  for (const line of contentLines) {
    if (!service) service = matchService(line);
    if (!paymentMethod) paymentMethod = matchPaymentMethod(line);
  }

  const merchant = cleanGopayMerchant(service, contentLines);
  if (isHeaderMerchant(merchant)) return null;

  return {
    title: merchant,
    merchant,
    amount,
    transactionDate: blockDate,
    type: inferType(contentLines.join(" "), amount),
    service,
    paymentMethodLabel: paymentMethod,
    rawLine: [txnId, ...contentLines].join(" | "),
  };
}

/** @deprecated Use repairExtractedTxnIds; kept for tests */
export function normalizeGopayText(text: string): string {
  return repairExtractedTxnIds(text);
}

export function parseGopayText(text: string): ParsedTransactionDraft[] {
  const fullText = repairExtractedTxnIds(text);
  const blocks = splitBlocksByTxnId(fullText);

  console.log("===== BLOCKS =====");
  console.log(blocks);

  let carryDate = new Date().toISOString().slice(0, 10);
  const parsed: ParsedTransactionDraft[] = [];

  for (const block of blocks) {
    const draft = parseBlock(
      block.txnId,
      block.lines,
      carryDate,
      block.dateHint,
    );
    if (draft) {
      carryDate = draft.transactionDate;
      parsed.push(draft);
    }
  }

  const rows = dedupeDrafts(parsed);

  console.log("===== PARSED ROWS =====");
  console.log(rows);

  return rows;
}
