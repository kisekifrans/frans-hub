import { countTxnIds, repairExtractedTxnIds } from "./parsers/txn-id-repair";

export type TextItem = {
  str?: string;
  transform?: number[];
  hasEOL?: boolean;
};

/** Min horizontal gap (PDF units) before treating same Y row as two columns */
const COLUMN_GAP = 72;

function shouldGlueParts(prev: string, next: string): boolean {
  if (/^[-–—]$/.test(next)) return true;
  if (/^(RB|F)$/i.test(prev)) return true;
  if (/(RB|F)$/i.test(prev) && /^[-–—\d]/.test(next)) return true;
  if (/[\d-]$/.test(prev) && /^\d/.test(next) && /RB|F/i.test(prev + next)) {
    return true;
  }
  return false;
}

function joinRowParts(parts: string[]): string {
  let out = "";
  for (const p of parts) {
    if (!out) {
      out = p;
      continue;
    }
    out += (shouldGlueParts(out, p) ? "" : " ") + p;
  }
  return out.replace(/\s+/g, " ").trim();
}

function splitRowSegments(
  row: { str: string; x: number }[],
): { str: string; x: number }[][] {
  if (row.length === 0) return [];
  const sorted = [...row].sort((a, b) => a.x - b.x);
  const segments: { str: string; x: number }[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const gap = cur.x - prev.x;
    if (gap >= COLUMN_GAP) {
      segments.push([cur]);
    } else {
      segments[segments.length - 1].push(cur);
    }
  }
  return segments;
}

/** Group pdf.js text items into lines; split wide rows (2-column Gojek tables). */
export function groupTextItemsIntoLines(items: TextItem[]): string[] {
  const positioned: {
    str: string;
    x: number;
    y: number;
    hasEOL: boolean;
  }[] = [];
  const orphans: string[] = [];

  for (const item of items) {
    const str = item.str?.trim();
    if (!str) continue;

    if (item.transform && item.transform.length >= 6) {
      positioned.push({
        str,
        x: item.transform[4],
        y: item.transform[5],
        hasEOL: !!item.hasEOL,
      });
    } else {
      orphans.push(str);
    }
  }

  const lines: string[] = [];

  if (positioned.length > 0) {
    positioned.sort((a, b) => {
      const dy = b.y - a.y;
      if (Math.abs(dy) > 3) return dy;
      return a.x - b.x;
    });

    let rowY: number | null = null;
    let rowParts: { str: string; x: number }[] = [];

    const flush = () => {
      for (const seg of splitRowSegments(rowParts)) {
        const line = joinRowParts(seg.map((p) => p.str));
        if (line) lines.push(line);
      }
      rowParts = [];
    };

    for (const item of positioned) {
      if (rowY !== null && Math.abs(item.y - rowY) > 4) {
        flush();
      }
      rowParts.push({ str: item.str, x: item.x });
      rowY = item.y;
      if (item.hasEOL) flush();
    }
    flush();
  }

  for (const o of orphans) {
    if (o.length > 0) lines.push(o);
  }

  return lines;
}

export function extractPageTextFromItems(
  items: TextItem[],
): { text: string; charCount: number; txnCount: number } {
  const pageText = groupTextItemsIntoLines(items).join("\n");
  const repaired = repairExtractedTxnIds(pageText);
  return {
    text: pageText,
    charCount: pageText.length,
    txnCount: countTxnIds(repaired),
  };
}

export async function loadPdfDocument(buffer: ArrayBuffer) {
  const pdfjs = await import("pdfjs-dist");

  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  return pdfjs.getDocument({ data: buffer }).promise;
}

export interface PdfJsExtractResult {
  pageTexts: string[];
  pageCharCounts: number[];
  pageTxnCounts: number[];
  numPages: number;
  mergedText: string;
  txnIdCount: number;
}

/** pdf.js-only extraction (Node + browser). */
export async function extractPdfJsFromBuffer(
  buffer: ArrayBuffer,
): Promise<PdfJsExtractResult> {
  const doc = await loadPdfDocument(buffer);
  const pageTexts: string[] = [];
  const pageCharCounts: number[] = [];
  const pageTxnCounts: number[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const content = await doc.getPage(i).then((p) => p.getTextContent());
    const { text, charCount, txnCount } = extractPageTextFromItems(
      content.items as TextItem[],
    );
    pageTexts.push(text);
    pageCharCounts.push(charCount);
    pageTxnCounts.push(txnCount);
  }

  const mergedText = repairExtractedTxnIds(pageTexts.join("\n\n"));
  return {
    pageTexts,
    pageCharCounts,
    pageTxnCounts,
    numPages: doc.numPages,
    mergedText,
    txnIdCount: countTxnIds(mergedText),
  };
}
