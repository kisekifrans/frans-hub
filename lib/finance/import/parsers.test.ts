import assert from "node:assert/strict";
import { parseStatementText } from "./parse-text";
import {
  parseGopayText,
  cleanGopayMerchant,
  stripServicePrefix,
} from "./parsers/gopay";
import { listTxnIds, repairExtractedTxnIds } from "./parsers/txn-id-repair";
import { groupTextItemsIntoLines } from "./pdf-page-text";
import { suggestCategory } from "./category-matcher";
import type { FinanceCategory } from "@/lib/finance/types";

const cats: FinanceCategory[] = [
  { id: "1", name: "Transport", icon: "🚕", color: "#3b82f6", type: "expense", order: 0 },
  { id: "2", name: "Food", icon: "🍔", color: "#f97316", type: "expense", order: 1 },
  { id: "3", name: "Drinks", icon: "🥤", color: "#06b6d4", type: "expense", order: 2 },
  { id: "4", name: "Steam / Gaming", icon: "🎮", color: "#8b5cf6", type: "expense", order: 3 },
];

const realGopayMultiline = `
Ringkasan transaksi GoPay
Periode 01/05/2026 - 31/05/2026

18/05/2026
11:14:41 AM
RB-4911364-88693875
GoCar
Bendega Restaurant
GoPayLater
Rp48.000

18/05/2026
F-3223936773
GoFood Burger King (Burger dan Ayam), Teuku Umar Bali
GoPay
Rp136.500

17/05/2026
RB-4911000-11111111
GoFood
KFC Sudirman
GoPay
Rp89.500

17/05/2026
F-3223000001
GoCar Comfort
Grand Indonesia
GoPayLater
Rp72.000

16/05/2026
RB-4911000-22222222
GoRide
Bandara Soekarno-Hatta
GoPay
Rp125.000

16/05/2026
F-3223000002
GoFood Starbucks Coffee
GoPay
Rp65.000

15/05/2026
RB-4911000-33333333
GoSend
Tokopedia
GoPay
Rp15.000

15/05/2026
F-3223000003
GoFood McDonald's
GoPayLater
Rp54.000

14/05/2026
RB-4911000-44444444
GoCar
Mall Kelapa Gading
GoPay
Rp38.000

14/05/2026
F-3223000004
GoFood Burger King
GoPay
Rp78.000

13/05/2026
RB-4911000-55555555
Gojek
Bluebird Taxi
GoPay
Rp42.000

13/05/2026
F-3223000005
GoFood Warung Padang
GoPay
Rp35.000

12/05/2026
RB-4911000-66666666
GoCar
Kantor Pusat
GoPayLater
Rp55.000

12/05/2026
F-3223000006
GoFood Pizza Hut
GoPay
Rp120.000

11/05/2026
RB-4911000-77777777
GoRide
Stasiun Gambir
GoPay
Rp28.000

11/05/2026
F-3223000007
GoFood Sushi Tei
GoPayLater
Rp250.000

10/05/2026
RB-4911000-88888888
GoCar Comfort
Bandung
GoPay
Rp180.000

10/05/2026
F-3223000008
GoFood Kopi Kenangan
GoPay
Rp32.000

09/05/2026
RB-4911000-99999999
GoSend
Shopee
GoPay
Rp12.000

09/05/2026
F-3223000009
TERIMA TOP UP DARI BCA
GoPay
Rp500.000

08/05/2026
RB-4911000-10101010
GoFood HokBen
GoPay
Rp45.000
`;

const r = parseStatementText(realGopayMultiline, "gopay");
assert.ok(
  r.transactions.length >= 20,
  `expected 20+ gopay transactions, got ${r.transactions.length}`,
);
assert.equal(r.errors.length, 0, "should not error when rows found");

const burger = r.transactions.find((t) =>
  t.rawLine?.includes("F-3223936773"),
);
assert.ok(burger, "should find Burger King merchant");
assert.equal(burger?.amount, 136500);
assert.equal(burger?.merchant.toLowerCase(), "burger king");
assert.equal(burger?.service, "GoFood");
assert.equal(burger?.paymentMethodLabel, "GoPay");

const gocar = r.transactions.find((t) => t.service === "GoCar");
assert.ok(gocar, "should find GoCar");
assert.equal(gocar?.amount, 48000);
assert.equal(gocar?.merchant, "Bendega Restaurant");

const cleaned = cleanGopayMerchant(
  "GoFood",
  ["GoFood Burger King (Burger dan Ayam), Teuku Umar Bali"],
);
assert.ok(cleaned.toLowerCase().includes("burger king"));

const foodCat = suggestCategory("Burger King", "expense", cats, {
  service: "GoFood",
});
assert.equal(foodCat?.name, "Food");

const transportCat = suggestCategory("Bendega Restaurant", "expense", cats, {
  service: "GoCar",
});
assert.equal(transportCat?.name, "Transport");

assert.equal(
  suggestCategory("Trip", "expense", cats, { service: "GoCar Comfort" })?.name,
  "Transport",
);
assert.equal(
  suggestCategory("Trip", "expense", cats, { service: "GrabCar" })?.name,
  "Transport",
);
assert.equal(
  suggestCategory("Order", "expense", cats, { service: "ShopeeFood" })?.name,
  "Food",
);
assert.equal(
  suggestCategory("Kopi Kenangan", "expense", cats, { service: "GoFood" })?.name,
  "Drinks",
);
assert.equal(
  suggestCategory("Steam Wallet", "expense", cats, { service: "GoPay" })?.name,
  "Steam / Gaming",
);

assert.equal(
  stripServicePrefix("GoCar Bendega Restaurant", "GoCar"),
  "Bendega Restaurant",
);
assert.equal(
  cleanGopayMerchant("GoCar", ["GoCar Bendega Restaurant"]),
  "Bendega Restaurant",
);

const gocarPreview = parseGopayText(
  "18/05/2026\nRB-4911364-88693875\nGoCar\nBendega Restaurant\nGoPayLater\nRp48.000",
);
assert.equal(gocarPreview[0]?.merchant, "Bendega Restaurant");
assert.equal(gocarPreview[0]?.service, "GoCar");
assert.equal(gocarPreview[0]?.paymentMethodLabel, "GoPayLater");
assert.equal(gocarPreview[0]?.amount, 48000);
assert.equal(
  suggestCategory(gocarPreview[0]!.merchant, "expense", cats, {
    service: gocarPreview[0]!.service,
  })?.name,
  "Transport",
);

const dupes = new Set(
  r.transactions.map(
    (t) => `${t.transactionDate}|${t.amount}|${t.merchant}`,
  ),
);
assert.equal(dupes.size, r.transactions.length, "no duplicate rows");

const direct = parseGopayText(realGopayMultiline);
assert.ok(direct.length >= 20);

/** Simulates pdf.js joining a whole page into one line (no line breaks) */
const pdfOneLine = `Ringkasan transaksi GoPay Periode transaksi: 1 Mei 2026 Total transaksi Rp5.000.000 PLUS bantu kamu hemat 18/05/2026 11:14:41 AM RB-4911364-88693875 GoCar Bendega Restaurant GoPayLater Rp48.000 13/05/2026 10:31:14 PM F-3223936773 GoFood Burger King (Burger dan Ayam) GoPay Rp136.500 17/05/2026 RB-4911000-11111111 GoFood KFC Sudirman GoPay Rp89.500 16/05/2026 F-3223000001 GoCar Comfort Grand Indonesia GoPayLater Rp72.000 15/05/2026 RB-4911000-33333333 GoCar Mall Kelapa Gading GoPay Rp38.000 14/05/2026 F-3223000004 GoFood McDonald's GoPay Rp54.000 13/05/2026 RB-4911000-55555555 Gojek Bluebird GoPay Rp42.000 12/05/2026 F-3223000006 GoFood Pizza Hut GoPay Rp120.000 11/05/2026 RB-4911000-77777777 GoRide Stasiun Gambir GoPay Rp28.000 10/05/2026 F-3223000008 GoFood Kopi Kenangan GoPay Rp32.000 09/05/2026 RB-4911000-99999999 GoSend Shopee GoPay Rp12.000 08/05/2026 F-3223000010 GoFood HokBen GoPay Rp45.000`;

const oneLineParsed = parseGopayText(pdfOneLine);
assert.ok(
  oneLineParsed.length >= 12,
  `one-line PDF should yield 12+ rows, got ${oneLineParsed.length}`,
);
assert.ok(
  !oneLineParsed.some((t) => /periode\s+transaksi/i.test(t.merchant)),
  "must not import header as merchant",
);
assert.ok(
  oneLineParsed.some((t) => t.merchant.includes("Bendega")),
  "should find GoCar merchant",
);

assert.ok(
  listTxnIds("18/05/2026 RB-4911364-88693875 GoCar Rp48.000").includes(
    "RB-4911364-88693875",
  ),
);

assert.ok(
  listTxnIds("RB 4911364-88693875 GoCar Bendega Rp48.000").includes(
    "RB-4911364-88693875",
  ),
  "repair split RB reference from PDF tokens",
);

/** Page 1 ends ~May 15; page 2 has May 18 GoCar (multi-page PDF) */
const page1Tail = `
14/05/2026
RB-4911000-44444444
GoCar
Mall Kelapa Gading
GoPay
Rp38.000
15/05/2026
F-3223000003
GoFood McDonald's
GoPayLater
Rp54.000
`;
const page2Head = `
Periode transaksi: 1 Mei 2026 - 31 Mei 2026
Total transaksi Rp5.000.000
PLUS bantu kamu hemat
Halaman 2 dari 5
18/05/2026
11:14:41 AM
RB-4911364-88693875
GoCar
Bendega Restaurant
GoPayLater
Rp48.000
17/05/2026
F-3223936999
GoFood Burger King
GoPay
Rp99.000
`;
const multiPage = parseGopayText(`${page1Tail}\n${page2Head}`);
assert.ok(
  multiPage.some(
    (t) =>
      t.service === "GoCar" &&
      t.merchant.includes("Bendega") &&
      t.transactionDate === "2026-05-18",
  ),
  "page 2 GoCar (May 18) must be parsed",
);
assert.ok(
  multiPage.some((t) => t.transactionDate >= "2026-05-17"),
  "transactions after May 15 must appear",
);
assert.ok(multiPage.length >= 4, `multi-page should yield 4+ rows, got ${multiPage.length}`);

/** Two-column row: same Y, far apart X → separate lines (not one mangled row) */
const twoColLines = groupTextItemsIntoLines([
  { str: "18/05/2026", transform: [1, 0, 0, 1, 40, 700], hasEOL: false },
  { str: "17/05/2026", transform: [1, 0, 0, 1, 320, 700], hasEOL: true },
  { str: "RB-4911364-88693875", transform: [1, 0, 0, 1, 40, 680], hasEOL: false },
  { str: "F-3223936773", transform: [1, 0, 0, 1, 320, 680], hasEOL: true },
]);
assert.ok(
  twoColLines.some((l) => l.includes("18/05/2026") && !l.includes("17/05/2026")),
  "left column date on its own line",
);
assert.ok(
  twoColLines.some((l) => /^F-3223936773$/i.test(l.trim())),
  "right column txn id on its own line",
);

assert.ok(
  listTxnIds(
    repairExtractedTxnIds("RB-4911364\n88693875\nGoCar\nRp48.000"),
  ).includes("RB-4911364-88693875"),
  "repair RB id split across lines",
);

/** Real Gojek table PDF: RB id suffix on time line below merchant block */
const gojekTableSnippet = `18/05/2026 RB-4911364- GoCar Bendega Restaurant
Jalan Gunung Kalimutu Gang
GoPayLater Rp48.000
11:14:41 AM 88693875
Ix, No. 11A
18/05/2026 RB-4916888- GoCar RS Mata Bali Madara
10:10:53 AM 18682661 Comfort
GoPayLater Rp40.500`;
const tableIds = listTxnIds(repairExtractedTxnIds(gojekTableSnippet));
assert.ok(tableIds.includes("RB-4911364-88693875"), "Gojek table RB join 1");
assert.ok(tableIds.includes("RB-4916888-18682661"), "Gojek table RB join 2");
assert.equal(tableIds.length, 2);

const tableParsed = parseGopayText(repairExtractedTxnIds(gojekTableSnippet));
assert.ok(
  tableParsed.some((t) => t.service === "GoCar"),
  "parse GoCar from Gojek table layout",
);
assert.ok(tableParsed.length >= 2, "Gojek table snippet yields 2+ rows");

const empty = parseStatementText("", "other");
assert.ok(empty.errors.length > 0);

console.log("finance import parser tests passed");
