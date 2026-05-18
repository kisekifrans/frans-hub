import type {
  FinanceBudgetLimit,
  FinanceBudgetPeriod,
  FinanceCategory,
  FinanceImportJob,
  FinancePaymentMethod,
  FinanceSubscription,
  FinanceTransaction,
} from "@/lib/finance/types";
import type {
  DbFinanceBudgetLimit,
  DbFinanceBudgetPeriod,
  DbFinanceCategory,
  DbFinanceImportJob,
  DbFinancePaymentMethod,
  DbFinanceSubscription,
  DbFinanceTransaction,
} from "./database.types";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function categoryFromDb(row: DbFinanceCategory): FinanceCategory {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    type: row.type as FinanceCategory["type"],
    order: row.sort_order,
    isDefault: row.is_default ?? false,
  };
}

export function categoryToDb(
  c: FinanceCategory,
  profileId: string,
): Omit<DbFinanceCategory, "created_at"> {
  return {
    id: c.id,
    profile_id: profileId,
    name: c.name.trim(),
    icon: c.icon,
    color: c.color,
    type: c.type,
    sort_order: c.order,
    is_default: c.isDefault ?? false,
  };
}

export function paymentMethodFromDb(
  row: DbFinancePaymentMethod,
): FinancePaymentMethod {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    order: row.sort_order,
  };
}

export function periodFromDb(row: DbFinanceBudgetPeriod): FinanceBudgetPeriod {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    salaryReceived:
      row.salary_received != null ? num(row.salary_received) : null,
    notes: row.notes ?? undefined,
  };
}

export function limitFromDb(row: DbFinanceBudgetLimit): FinanceBudgetLimit {
  return {
    id: row.id,
    categoryId: row.category_id,
    periodId: row.period_id,
    limitAmount: num(row.limit_amount),
    warningThreshold: num(row.warning_threshold),
  };
}

export function transactionFromDb(
  row: DbFinanceTransaction,
): FinanceTransaction {
  return {
    id: row.id,
    type: row.type as FinanceTransaction["type"],
    title: row.title,
    description: row.description ?? "",
    amount: num(row.amount),
    currency: row.currency ?? "IDR",
    categoryId: row.category_id ?? undefined,
    paymentMethodId: row.payment_method_id ?? undefined,
    transactionDate: row.transaction_date,
    periodId: row.period_id ?? undefined,
    recurring: row.recurring,
    tags: row.tags ?? [],
    attachmentUrl: row.attachment_url ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export function subscriptionFromDb(
  row: DbFinanceSubscription,
): FinanceSubscription {
  return {
    id: row.id,
    name: row.name,
    amount: num(row.amount),
    currency: row.currency ?? "IDR",
    billingCycle: row.billing_cycle as FinanceSubscription["billingCycle"],
    nextPaymentDate: row.next_payment_date,
    categoryId: row.category_id ?? undefined,
    paymentMethodId: row.payment_method_id ?? undefined,
    autoRenew: row.auto_renew,
    active: row.active,
    notes: row.notes ?? undefined,
  };
}

export function importJobFromDb(row: DbFinanceImportJob): FinanceImportJob {
  return {
    id: row.id,
    source: row.source as FinanceImportJob["source"],
    fileUrl: row.file_url ?? undefined,
    storagePath: row.storage_path ?? undefined,
    status: row.status as FinanceImportJob["status"],
    errorMessage: row.error_message ?? undefined,
    parsedCount: row.parsed_count,
    createdAt: row.created_at,
  };
}

export function transactionToDb(
  t: FinanceTransaction,
  profileId: string,
): Omit<DbFinanceTransaction, "created_at" | "updated_at"> {
  return {
    id: t.id,
    profile_id: profileId,
    type: t.type,
    title: t.title.trim(),
    description: t.description ?? "",
    amount: t.amount,
    currency: t.currency ?? "IDR",
    category_id: t.categoryId ?? null,
    payment_method_id: t.paymentMethodId ?? null,
    transaction_date: t.transactionDate,
    period_id: t.periodId ?? null,
    recurring: t.recurring,
    tags: t.tags ?? [],
    attachment_url: t.attachmentUrl ?? null,
    notes: t.notes ?? null,
  };
}
