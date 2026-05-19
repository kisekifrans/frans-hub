/**
 * Quick per-page dump: npx tsx scripts/inspect-gopay-pdf.ts
 */
import fs from "node:fs";
import path from "node:path";
import {
  extractPageTextFromItems,
  loadPdfDocument,
  type TextItem,
} from "../lib/finance/import/pdf-page-text";
import { listTxnIds, repairExtractedTxnIds } from "../lib/finance/import/parsers/txn-id-repair";

const pdfPath = path.join(
  process.cwd(),
  "test-fixtures",
  "Riwayat_transaksi_Gojek_010526-190526.pdf",
);
const buf = fs.readFileSync(pdfPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

async function main() {
  const doc = await loadPdfDocument(ab);

  for (let i = 1; i <= doc.numPages; i++) {
    const content = await doc.getPage(i).then((p) => p.getTextContent());
    const { text } = extractPageTextFromItems(content.items as TextItem[]);
    const repaired = repairExtractedTxnIds(text);
    const ids = listTxnIds(repaired);
    console.log(`\n======== PAGE ${i} (${ids.length} ids) ========`);
    console.log("GoCar:", /GoCar/i.test(repaired));
    console.log("RB-:", (repaired.match(/RB-\d+-\d+/gi) ?? []).length);
    console.log(
      "dates:",
      [...repaired.matchAll(/\d{2}\/\d{2}\/\d{4}/g)].map((m) => m[0]).slice(0, 8),
    );
    console.log("--- text (first 1200 chars) ---");
    console.log(repaired.slice(0, 1200));
    console.log("--- text (last 800 chars) ---");
    console.log(repaired.slice(-800));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
