import type { FinanceSubscription } from "@/lib/finance/types";
import { toISODate } from "@/lib/finance/format";

export function daysUntilBilling(nextPaymentDate: string): number {
  const today = toISODate();
  const end = new Date(nextPaymentDate + "T12:00:00");
  const now = new Date(today + "T12:00:00");
  return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
}

export function isSubscriptionOverdue(sub: FinanceSubscription): boolean {
  if (!sub.active) return false;
  return daysUntilBilling(sub.nextPaymentDate) < 0;
}

export function billingCountdownLabel(sub: FinanceSubscription): string {
  const days = daysUntilBilling(sub.nextPaymentDate);
  if (!sub.active) return "Inactive";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
