import type { FinanceBudgetPeriod } from "@/lib/finance/types";
import { toISODate } from "@/lib/finance/format";

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Bi-weekly salary periods: 1–15 and 16–end (matches 5th & 15th pay cycle). */
export function generateSalaryPeriodsForYear(
  year: number,
): Omit<FinanceBudgetPeriod, "id" | "salaryReceived" | "notes">[] {
  const periods: Omit<FinanceBudgetPeriod, "id" | "salaryReceived" | "notes">[] =
    [];

  for (let month = 0; month < 12; month++) {
    const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
      new Date(year, month, 1),
    );
    const last = lastDayOfMonth(year, month);

    periods.push({
      name: `${monthName} 1–15`,
      startDate: `${year}-${pad(month + 1)}-01`,
      endDate: `${year}-${pad(month + 1)}-15`,
    });

    periods.push({
      name: `${monthName} 16–${last}`,
      startDate: `${year}-${pad(month + 1)}-16`,
      endDate: `${year}-${pad(month + 1)}-${pad(last)}`,
    });
  }

  return periods;
}

export function periodContainsDate(
  period: Pick<FinanceBudgetPeriod, "startDate" | "endDate">,
  dateIso: string,
): boolean {
  return dateIso >= period.startDate && dateIso <= period.endDate;
}

export function findPeriodForDate(
  periods: FinanceBudgetPeriod[],
  dateIso: string = toISODate(),
): FinanceBudgetPeriod | undefined {
  return periods.find((p) => periodContainsDate(p, dateIso));
}

export function daysRemainingInPeriod(
  period: Pick<FinanceBudgetPeriod, "endDate">,
  dateIso: string = toISODate(),
): number {
  const end = new Date(period.endDate + "T23:59:59");
  const now = new Date(dateIso + "T12:00:00");
  const diff = Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

export function periodProgressPercent(
  period: Pick<FinanceBudgetPeriod, "startDate" | "endDate">,
  dateIso: string = toISODate(),
): number {
  const start = new Date(period.startDate + "T00:00:00").getTime();
  const end = new Date(period.endDate + "T23:59:59").getTime();
  const now = new Date(dateIso + "T12:00:00").getTime();
  if (end <= start) return 100;
  const pct = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, pct));
}
