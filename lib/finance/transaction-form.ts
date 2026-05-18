import type { FinanceTransaction } from "@/lib/finance/types";
import { toISODate } from "@/lib/finance/format";

export function parseIdrInput(value: string): number {
  const n = Number(value.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function tagsToInput(tags: string[]): string {
  return tags.join(", ");
}

export function draftFromTransaction(
  t: FinanceTransaction,
  forDuplicate: boolean,
): Omit<FinanceTransaction, "id" | "createdAt"> & { id?: string } {
  return {
    type: t.type,
    title: forDuplicate ? t.title : t.title,
    description: t.description,
    amount: t.amount,
    currency: t.currency,
    categoryId: t.categoryId,
    paymentMethodId: t.paymentMethodId,
    transactionDate: forDuplicate ? toISODate() : t.transactionDate,
    periodId: forDuplicate ? undefined : t.periodId,
    recurring: t.recurring,
    tags: [...t.tags],
    attachmentUrl: t.attachmentUrl,
    notes: t.notes,
  };
}
