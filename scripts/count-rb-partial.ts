import fs from "node:fs";
import path from "node:path";
import { extractPdfJsFromBuffer } from "../lib/finance/import/pdf-page-text";
import { repairExtractedTxnIds, listTxnIds } from "../lib/finance/import/parsers/txn-id-repair";
import { parseGopayText } from "../lib/finance/import/parsers/gopay";

async function main() {
  const pdfPath = path.join(
    process.cwd(),
    "test-fixtures",
    "Riwayat_transaksi_Gojek_010526-190526.pdf",
  );
  const buf = fs.readFileSync(pdfPath);
  const extracted = await extractPdfJsFromBuffer(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
  const t = repairExtractedTxnIds(extracted.mergedText);
  const partial = [...t.matchAll(/\bRB-\d+-(?!\d)/g)];
  const full = listTxnIds(t);
  console.log("full ids", full.length, "RB", full.filter((x) => x.startsWith("RB")).length);
  console.log("unrepaired partial", partial.length, partial.map((m) => m[0]));
  const rows = parseGopayText(t);
  console.log("parsed", rows.length);
  console.log(
    "by service",
    Object.fromEntries(
      [...new Set(rows.map((r) => r.service ?? "?"))].map((s) => [
        s,
        rows.filter((r) => (r.service ?? "?") === s).length,
      ]),
    ),
  );
}

main();
