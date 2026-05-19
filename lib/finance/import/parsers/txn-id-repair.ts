/**
 * PDF text often splits GoPay reference numbers across tokens:
 * "RB" "4911364" "-88693875" or "F" "3223936773"
 *
 * Gojek table PDFs also split RB ids across rows:
 *   18/05/2026 RB-4911364- GoCar Bendega Restaurant
 *   11:14:41 AM 88693875
 */
export function repairGojekTableRbIds(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const partial = line.match(/\bRB-(\d+)-(?=\s|$)/);
    const alreadyFull = /\bRB-\d+-\d+\b/.test(line);

    if (partial && !alreadyFull) {
      const prefix = partial[1];
      for (let j = i + 1; j < Math.min(i + 12, lines.length); j++) {
        const next = lines[j];
        if (/\bRB-\d+-\d+\b/.test(next) || /\bF-\d{6,}\b/.test(next)) break;
        if (/\d{2}\/\d{2}\/\d{4}/.test(next) && /\bRB-\d+-/.test(next)) break;

        const tm = next.match(
          /^\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\s+(\d{6,})\b/i,
        );
        if (tm) {
          const fullId = `RB-${prefix}-${tm[1]}`;
          line = line.replace(/\bRB-\d+-/, `${fullId} `);
          lines[j] = next
            .replace(tm[1], "")
            .replace(/\s{2,}/g, " ")
            .trim();
          break;
        }
      }
    }

    out.push(line);
  }

  return out.join("\n");
}

export function repairExtractedTxnIds(text: string): string {
  let out = text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    // OCR: R8 / R B misread as RB
    .replace(/\bR\s*8\s*[-–]?\s*(\d+)\s*[-–]\s*(\d+)\b/gi, "RB-$1-$2")
    .replace(/\bR\s*B\s*[-–]?\s*(\d+)\s*[-–]\s*(\d+)\b/gi, "RB-$1-$2")
    // RB 4911364-88693875 / RB-4911364 88693875
    .replace(/\bRB\s*[-–]?\s*(\d+)\s*[-–]\s*(\d+)\b/gi, "RB-$1-$2")
    // RB-4911364 newline 88693875 (split across lines)
    .replace(/\b(RB-\d+)\s*[\n]+\s*(\d{6,})\b/gi, "$1-$2")
    // RB4911364-88693875 (no hyphen after RB)
    .replace(/\bRB(\d{6,})[-–](\d+)\b/gi, "RB-$1-$2")
    // F 3223936773 / F- 3223936773
    .replace(/\bF\s*[-–]?\s*(\d{6,})\b/gi, "F-$1")
    .replace(/\bRB\n+(\d+)\n*[-–]?\n*(\d+)\b/gi, "RB-$1-$2")
    .replace(/\bF\n+(\d{6,})\b/gi, "F-$1");

  out = repairGojekTableRbIds(out);

  return out;
}

/** Count anchors in text (for extract vs parse diagnostics) */
export function countTxnIds(text: string): number {
  const repaired = repairExtractedTxnIds(text);
  const m = repaired.match(/RB-\d+-\d+|F-\d{6,}/gi);
  return m?.length ?? 0;
}

export function listTxnIds(text: string): string[] {
  const repaired = repairExtractedTxnIds(text);
  return [...repaired.matchAll(/(RB-\d+-\d+|F-\d{6,})/gi)].map((x) => x[1]);
}
