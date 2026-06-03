import type { ParsedCsv } from "./types";

export interface CsvBundle {
  id: string;
  name: string;
  headers: string[];
  rows: Record<string, string>[];
}

export function createCsvBundle(parsed: ParsedCsv, name: string): CsvBundle {
  return {
    id: crypto.randomUUID(),
    name,
    headers: parsed.headers,
    rows: parsed.rows,
  };
}

/** Union headers and concatenate rows from multiple CSV uploads. */
export function mergeCsvBundles(bundles: CsvBundle[]): {
  headers: string[];
  rows: Record<string, string>[];
} {
  if (bundles.length === 0) {
    return { headers: [], rows: [] };
  }

  const headerOrder: string[] = [];
  const seen = new Set<string>();

  for (const bundle of bundles) {
    for (const h of bundle.headers) {
      if (!seen.has(h)) {
        seen.add(h);
        headerOrder.push(h);
      }
    }
  }

  const rows: Record<string, string>[] = [];
  for (const bundle of bundles) {
    for (const row of bundle.rows) {
      const normalized: Record<string, string> = {};
      for (const h of headerOrder) {
        normalized[h] = row[h] ?? "";
      }
      rows.push(normalized);
    }
  }

  return { headers: headerOrder, rows };
}
