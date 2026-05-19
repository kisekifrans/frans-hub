import fs from "node:fs";
import {
  extractPageTextFromItems,
  loadPdfDocument,
  type TextItem,
} from "../lib/finance/import/pdf-page-text";
import { repairExtractedTxnIds } from "../lib/finance/import/parsers/txn-id-repair";

async function main() {
  const buf = fs.readFileSync("test-fixtures/Riwayat_transaksi_Gojek_010526-190526.pdf");
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const doc = await loadPdfDocument(ab);
  const c = await doc.getPage(1).then((p) => p.getTextContent());
  const { text } = extractPageTextFromItems(c.items as TextItem[]);
  const idx = text.indexOf("Pandaloka");
  console.log(text.slice(Math.max(0, idx - 400), idx + 600));
  console.log("--- repaired ---");
  console.log(repairExtractedTxnIds(text).slice(Math.max(0, idx - 400), idx + 600));
}

main();
