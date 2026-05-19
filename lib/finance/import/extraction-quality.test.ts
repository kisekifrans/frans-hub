import assert from "node:assert/strict";
import {
  assessExtractionQuality,
  hasTransportService,
  looksFoodOnlyExtraction,
  minTxnIdsForFilename,
  parseFilenameDateRange,
} from "./extraction-quality";

const poorSample = `
15/05/2026
RB-111-222
GoFood
KFC
GoPay
Rp50000
`.repeat(19);

const q = assessExtractionQuality(poorSample);
assert.equal(q.passes, false);
assert.ok(q.reasons.length > 0);

const withGoCar = poorSample + `
18/05/2026
RB-4911364-88693875
GoCar
Bendega
GoPayLater
Rp48000
`;

assert.equal(
  parseFilenameDateRange("Riwayat_transaksi_Gojek_010526-190526.pdf").endIso,
  "2026-05-19",
);
assert.equal(
  minTxnIdsForFilename("Riwayat_transaksi_Gojek_010526-190526.pdf"),
  19,
);

assert.equal(
  hasTransportService("Riwayat transaksi Gojek\nPeriode transaksi"),
  false,
  "header Gojek must not count as transport",
);
assert.ok(hasTransportService("RB-1-2\nGoCar\nJl. Sudirman\nGoPay\nRp10000"));
assert.ok(
  hasTransportService("18/05/2026 RB-4911364- GoCar Bendega Restaurant"),
  "inline GoCar on table row counts as transport",
);

const incomplete = assessExtractionQuality(
  poorSample,
  "Riwayat_transaksi_Gojek_010526-190526.pdf",
);
assert.equal(incomplete.passes, false);
assert.ok(
  incomplete.reasons.some((r) => r.includes("2026-05-19") || r.includes("transaction IDs")),
);

const foodOnly = "F-3223936773\nGoFood\nKFC\nGoPay\nRp50000\n".repeat(19);
assert.ok(looksFoodOnlyExtraction(foodOnly, 19));
const foodOnlyQ = assessExtractionQuality(
  foodOnly,
  "Riwayat_transaksi_Gojek_010526-190526.pdf",
);
assert.ok(
  foodOnlyQ.reasons.some((r) => r.includes("F-") || r.includes("RB-")),
  "food-only extraction should fail quality",
);

console.log("extraction-quality tests passed");
