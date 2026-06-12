import type { CsvSourceType } from "./types";

const MONTH_MAP: Record<string, string> = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  sept: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isValidDate(y: number, m: number, d: number): boolean {
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

/** Try to extract YYYY-MM-DD from a CSV filename. */
export function detectDateFromFilename(fileName: string): string | undefined {
  const base = fileName.replace(/\.csv$/i, "");

  const iso = base.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (isValidDate(y, m, d)) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  const slash = base.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (slash) {
    const y = Number(slash[1]);
    const m = Number(slash[2]);
    const d = Number(slash[3]);
    if (isValidDate(y, m, d)) {
      return `${slash[1]}-${slash[2]}-${slash[3]}`;
    }
  }

  const dmyNamed = base.match(/(\d{1,2})[-_]([a-z]+)(?:[-_](\d{4}))?/i);
  if (dmyNamed) {
    const month = MONTH_MAP[dmyNamed[2].toLowerCase()];
    if (month) {
      const day = pad2(Number(dmyNamed[1]));
      const year = dmyNamed[3] ?? String(new Date().getFullYear());
      const y = Number(year);
      const m = Number(month);
      const d = Number(day);
      if (isValidDate(y, m, d)) return `${year}-${month}-${day}`;
    }
  }

  return undefined;
}

export function detectSourceTypeFromFilename(
  fileName: string,
): CsvSourceType | undefined {
  const lower = fileName.toLowerCase();
  if (lower.includes("reviewer") && lower.includes("auditor")) return "Mixed";
  if (lower.includes("reviewer")) return "Reviewer";
  if (lower.includes("auditor")) return "Auditor";
  return undefined;
}

export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
