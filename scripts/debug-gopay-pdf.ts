/**
 * Run: npx tsx scripts/debug-gopay-pdf.ts [path-to.pdf]
 * Default: test-fixtures/Riwayat_transaksi_Gojek_010526-190526.pdf
 */
import fs from "node:fs";
import path from "node:path";
import { assessExtractionQuality } from "../lib/finance/import/extraction-quality";
import { extractPdfJsFromBuffer } from "../lib/finance/import/pdf-page-text";
import { parseGopayText } from "../lib/finance/import/parsers/gopay";
import { listTxnIds } from "../lib/finance/import/parsers/txn-id-repair";

const defaultPdf = path.join(
  process.cwd(),
  "test-fixtures",
  "Riwayat_transaksi_Gojek_010526-190526.pdf",
);
const pdfPath = path.resolve(process.argv[2] ?? defaultPdf);
const filename = path.basename(pdfPath);

if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  console.error("Copy your Gojek statement there and re-run.");
  process.exit(1);
}

async function main() {
  const buffer = fs.readFileSync(pdfPath);
  const extracted = await extractPdfJsFromBuffer(
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ),
  );

  console.log("=== pdf.js extraction ===");
  console.log("file:", pdfPath);
  console.log("pages:", extracted.numPages);
  console.log("chars/page:", extracted.pageCharCounts);
  console.log("txnIds/page:", extracted.pageTxnCounts);
  console.log("total txn ids:", extracted.txnIdCount);

  const quality = assessExtractionQuality(extracted.mergedText, filename);
  console.log("quality:", quality);

  const ids = listTxnIds(extracted.mergedText);
  console.log("txn id sample:", ids.slice(0, 5), "...", ids.slice(-3));

  const rows = parseGopayText(extracted.mergedText);
  const services = [...new Set(rows.map((r) => r.service).filter(Boolean))];
  const maxDate = rows.reduce(
    (m, r) => (r.transactionDate > m ? r.transactionDate : m),
    "",
  );

  console.log("=== parser (pdf.js text only) ===");
  console.log("parsed rows:", rows.length);
  console.log("services:", services.join(", ") || "(none)");
  console.log("latest date:", maxDate);
  console.log("GoCar rows:", rows.filter((r) => r.service === "GoCar").length);

  if (quality.passes) {
    console.log("\nNote: quality PASSED on pdf.js alone — browser should not need OCR.");
  } else {
    console.log("\nNote: quality FAILED — browser import should run full-page OCR hybrid.");
    console.log("reasons:", quality.reasons.join("; "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
