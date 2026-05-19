import type { ImportSource } from "@/lib/finance/types";
import type { ImportParseResult } from "./types";
import { parseBankText } from "./parsers/bank";
import { parseGenericText } from "./parsers/generic";
import { parseGopayText } from "./parsers/gopay";
import { parseShopeepayText } from "./parsers/shopeepay";

export function parseStatementText(
  text: string,
  source: ImportSource,
): ImportParseResult {
  const normalized = text.replace(/\u00a0/g, " ").trim();
  const errors: string[] = [];

  if (!normalized) {
    return {
      source,
      transactions: [],
      errors: ["PDF contains no extractable text. OCR is not enabled yet."],
    };
  }

  let transactions;
  switch (source) {
    case "gopay":
      transactions = parseGopayText(normalized);
      break;
    case "bank":
      transactions = parseBankText(normalized);
      break;
    case "shopeepay":
      transactions = parseShopeepayText(normalized);
      break;
    default:
      transactions = parseGenericText(normalized);
  }

  if (transactions.length === 0) {
    errors.push(
      "No transactions detected. Try another provider or check the PDF format.",
    );
  }

  return { source, transactions, errors };
}
