import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from "@/lib/finance/defaults";
import { generateSalaryPeriodsForYear } from "@/lib/finance/periods";
import { findPeriodForDate } from "@/lib/finance/periods";
import { toISODate } from "@/lib/finance/format";
import { normalizeCategoryEmoji } from "@/lib/finance/categories";
import type {
  CategoryUsageInfo,
  FinanceBudgetLimit,
  FinanceBudgetPeriod,
  FinanceCategory,
  FinanceImportJob,
  FinancePageData,
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
import {
  dedupeCategories,
  dedupePaymentMethods,
} from "@/lib/finance/dedupe";
import {
  categoryFromDb,
  categoryToDb,
  importJobFromDb,
  limitFromDb,
  paymentMethodFromDb,
  periodFromDb,
  subscriptionFromDb,
  transactionFromDb,
  transactionToDb,
} from "./finance-mappers";

const PROFILE_SLUG = "main";
const seedingProfiles = new Set<string>();
const seedWaiters = new Map<string, Array<() => void>>();

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

async function withSeedLock(
  profileId: string,
  fn: () => Promise<void>,
): Promise<void> {
  if (seedingProfiles.has(profileId)) {
    await new Promise<void>((resolve) => {
      const list = seedWaiters.get(profileId) ?? [];
      list.push(resolve);
      seedWaiters.set(profileId, list);
    });
    return;
  }
  seedingProfiles.add(profileId);
  try {
    await fn();
  } finally {
    seedingProfiles.delete(profileId);
    const waiters = seedWaiters.get(profileId) ?? [];
    seedWaiters.delete(profileId);
    waiters.forEach((w) => w());
  }
}

async function resolveProfileId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", PROFILE_SLUG)
    .single();
  if (error || !data) throw new Error("Profile not found");
  return data.id as string;
}

async function seedDefaults(
  supabase: SupabaseClient,
  profileId: string,
): Promise<void> {
  await withSeedLock(profileId, async () => {
    const cats = [
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES,
    ];
    for (let i = 0; i < cats.length; i++) {
      const c = cats[i];
      const { data: existing } = await supabase
        .from("finance_categories")
        .select("id")
        .eq("profile_id", profileId)
        .eq("type", c.type)
        .ilike("name", c.name)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("finance_categories").insert({
        profile_id: profileId,
        name: c.name,
        icon: c.icon,
        color: c.color,
        type: c.type,
        sort_order: i,
      });
      if (error && !isUniqueViolation(error)) throw error;
    }

    for (let i = 0; i < DEFAULT_PAYMENT_METHODS.length; i++) {
      const m = DEFAULT_PAYMENT_METHODS[i];
      const { data: existing } = await supabase
        .from("finance_payment_methods")
        .select("id")
        .eq("profile_id", profileId)
        .ilike("name", m.name)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("finance_payment_methods").insert({
        profile_id: profileId,
        name: m.name,
        icon: m.icon,
        sort_order: i,
      });
      if (error && !isUniqueViolation(error)) throw error;
    }
  });
}

async function ensureYearPeriods(
  supabase: SupabaseClient,
  profileId: string,
): Promise<void> {
  const year = new Date().getFullYear();
  const { data: existing } = await supabase
    .from("finance_budget_periods")
    .select("start_date, end_date")
    .eq("profile_id", profileId)
    .gte("start_date", `${year}-01-01`)
    .lte("end_date", `${year}-12-31`);

  const keySet = new Set(
    (existing ?? []).map(
      (p: { start_date: string; end_date: string }) =>
        `${p.start_date}_${p.end_date}`,
    ),
  );

  const toInsert = generateSalaryPeriodsForYear(year)
    .filter((p) => !keySet.has(`${p.startDate}_${p.endDate}`))
    .map((p) => ({
      profile_id: profileId,
      name: p.name,
      start_date: p.startDate,
      end_date: p.endDate,
    }));

  if (toInsert.length) {
    await supabase.from("finance_budget_periods").insert(toInsert);
  }
}

export async function fetchFinanceData(
  supabase: SupabaseClient,
): Promise<FinancePageData> {
  const profileId = await resolveProfileId(supabase);
  await seedDefaults(supabase, profileId);
  await ensureYearPeriods(supabase, profileId);

  const [
    categoriesRes,
    methodsRes,
    periodsRes,
    limitsRes,
    txRes,
    subsRes,
    jobsRes,
  ] = await Promise.all([
    supabase
      .from("finance_categories")
      .select("*")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("finance_payment_methods")
      .select("*")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("finance_budget_periods")
      .select("*")
      .eq("profile_id", profileId)
      .order("start_date", { ascending: false }),
    supabase.from("finance_budget_limits").select("*").eq("profile_id", profileId),
    supabase
      .from("finance_transactions")
      .select("*")
      .eq("profile_id", profileId)
      .order("transaction_date", { ascending: false }),
    supabase
      .from("finance_subscriptions")
      .select("*")
      .eq("profile_id", profileId)
      .order("next_payment_date"),
    supabase
      .from("finance_import_jobs")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const err =
    categoriesRes.error ||
    methodsRes.error ||
    periodsRes.error ||
    limitsRes.error ||
    txRes.error ||
    subsRes.error ||
    jobsRes.error;
  if (err) throw err;

  return {
    profileId,
    categories: dedupeCategories(
      (categoriesRes.data as DbFinanceCategory[]).map(categoryFromDb),
    ),
    paymentMethods: dedupePaymentMethods(
      (methodsRes.data as DbFinancePaymentMethod[]).map(paymentMethodFromDb),
    ),
    periods: (periodsRes.data as DbFinanceBudgetPeriod[]).map(periodFromDb),
    limits: (limitsRes.data as DbFinanceBudgetLimit[]).map(limitFromDb),
    transactions: (txRes.data as DbFinanceTransaction[]).map(transactionFromDb),
    subscriptions: (subsRes.data as DbFinanceSubscription[]).map(
      subscriptionFromDb,
    ),
    importJobs: (jobsRes.data as DbFinanceImportJob[] | null)?.map(
      importJobFromDb,
    ) ?? [],
  };
}

export async function createTransaction(
  supabase: SupabaseClient,
  profileId: string,
  input: Omit<FinanceTransaction, "id" | "createdAt">,
  periods: FinanceBudgetPeriod[],
): Promise<FinanceTransaction> {
  const period =
    input.periodId
      ? periods.find((p) => p.id === input.periodId)
      : findPeriodForDate(periods, input.transactionDate);

  const row = {
    ...transactionToDb(
      {
        ...input,
        id: crypto.randomUUID(),
        periodId: period?.id ?? input.periodId,
        createdAt: new Date().toISOString(),
      },
      profileId,
    ),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("finance_transactions")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return transactionFromDb(data as DbFinanceTransaction);
}

export async function updateTransaction(
  supabase: SupabaseClient,
  profileId: string,
  item: FinanceTransaction,
  periods: FinanceBudgetPeriod[],
): Promise<FinanceTransaction> {
  const period = findPeriodForDate(periods, item.transactionDate);
  const row = {
    ...transactionToDb(
      {
        ...item,
        periodId: period?.id ?? item.periodId,
      },
      profileId,
    ),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("finance_transactions")
    .update(row)
    .eq("id", item.id)
    .select()
    .single();
  if (error) throw error;
  return transactionFromDb(data as DbFinanceTransaction);
}

export async function deleteTransaction(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function upsertBudgetLimit(
  supabase: SupabaseClient,
  profileId: string,
  limit: Omit<FinanceBudgetLimit, "id"> & { id?: string },
): Promise<FinanceBudgetLimit> {
  const payload = {
    limit_amount: limit.limitAmount,
    warning_threshold: limit.warningThreshold,
  };

  const { data: updated, error: updateError } = await supabase
    .from("finance_budget_limits")
    .update(payload)
    .eq("profile_id", profileId)
    .eq("period_id", limit.periodId)
    .eq("category_id", limit.categoryId)
    .select()
    .maybeSingle();

  if (updateError) throw updateError;
  if (updated) return limitFromDb(updated as DbFinanceBudgetLimit);

  const row = {
    id: limit.id ?? crypto.randomUUID(),
    profile_id: profileId,
    category_id: limit.categoryId,
    period_id: limit.periodId,
    ...payload,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("finance_budget_limits")
    .insert(row)
    .select()
    .single();

  if (insertError) {
    if (isUniqueViolation(insertError)) {
      const { data: retry, error: retryError } = await supabase
        .from("finance_budget_limits")
        .update(payload)
        .eq("profile_id", profileId)
        .eq("period_id", limit.periodId)
        .eq("category_id", limit.categoryId)
        .select()
        .single();
      if (retryError) throw retryError;
      return limitFromDb(retry as DbFinanceBudgetLimit);
    }
    throw insertError;
  }

  return limitFromDb(inserted as DbFinanceBudgetLimit);
}

export async function updatePeriod(
  supabase: SupabaseClient,
  period: FinanceBudgetPeriod,
): Promise<FinanceBudgetPeriod> {
  const { data, error } = await supabase
    .from("finance_budget_periods")
    .update({
      name: period.name,
      start_date: period.startDate,
      end_date: period.endDate,
      salary_received: period.salaryReceived,
      notes: period.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", period.id)
    .select()
    .single();
  if (error) throw error;
  return periodFromDb(data as DbFinanceBudgetPeriod);
}

export async function createSubscription(
  supabase: SupabaseClient,
  profileId: string,
  sub: Omit<FinanceSubscription, "id">,
): Promise<FinanceSubscription> {
  const { data, error } = await supabase
    .from("finance_subscriptions")
    .insert({
      profile_id: profileId,
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      billing_cycle: sub.billingCycle,
      next_payment_date: sub.nextPaymentDate,
      category_id: sub.categoryId ?? null,
      payment_method_id: sub.paymentMethodId ?? null,
      auto_renew: sub.autoRenew,
      active: sub.active,
      notes: sub.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return subscriptionFromDb(data as DbFinanceSubscription);
}

export async function updateSubscription(
  supabase: SupabaseClient,
  sub: FinanceSubscription,
): Promise<FinanceSubscription> {
  const { data, error } = await supabase
    .from("finance_subscriptions")
    .update({
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      billing_cycle: sub.billingCycle,
      next_payment_date: sub.nextPaymentDate,
      category_id: sub.categoryId ?? null,
      payment_method_id: sub.paymentMethodId ?? null,
      auto_renew: sub.autoRenew,
      active: sub.active,
      notes: sub.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id)
    .select()
    .single();
  if (error) throw error;
  return subscriptionFromDb(data as DbFinanceSubscription);
}

export async function deleteSubscription(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("finance_subscriptions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getCategoryUsage(
  supabase: SupabaseClient,
  profileId: string,
  categoryId: string,
): Promise<CategoryUsageInfo> {
  const [txRes, subRes, limitRes] = await Promise.all([
    supabase
      .from("finance_transactions")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("category_id", categoryId),
    supabase
      .from("finance_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("category_id", categoryId),
    supabase
      .from("finance_budget_limits")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("category_id", categoryId),
  ]);

  if (txRes.error) throw txRes.error;
  if (subRes.error) throw subRes.error;
  if (limitRes.error) throw limitRes.error;

  const transactions = txRes.count ?? 0;
  const subscriptions = subRes.count ?? 0;
  const budgetLimits = limitRes.count ?? 0;

  return {
    transactions,
    subscriptions,
    budgetLimits,
    total: transactions + subscriptions + budgetLimits,
  };
}

export async function createCategory(
  supabase: SupabaseClient,
  profileId: string,
  input: {
    name: string;
    icon: string;
    color: string;
    type: FinanceCategory["type"];
    order?: number;
  },
): Promise<FinanceCategory> {
  let sortOrder = input.order;
  if (sortOrder == null) {
    const { data: last } = await supabase
      .from("finance_categories")
      .select("sort_order")
      .eq("profile_id", profileId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((last as { sort_order: number } | null)?.sort_order ?? -1) + 1;
  }

  const row = {
    profile_id: profileId,
    name: input.name.trim(),
    icon: normalizeCategoryEmoji(input.icon),
    color: input.color,
    type: input.type,
    sort_order: sortOrder,
    is_default: false,
  };

  const { data, error } = await supabase
    .from("finance_categories")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return categoryFromDb(data as DbFinanceCategory);
}

export async function updateCategory(
  supabase: SupabaseClient,
  profileId: string,
  category: FinanceCategory,
): Promise<FinanceCategory> {
  const row = categoryToDb(
    {
      ...category,
      icon: normalizeCategoryEmoji(category.icon),
      name: category.name.trim(),
    },
    profileId,
  );
  const { data, error } = await supabase
    .from("finance_categories")
    .update({
      name: row.name,
      icon: row.icon,
      color: row.color,
      type: row.type,
      sort_order: row.sort_order,
    })
    .eq("id", category.id)
    .eq("profile_id", profileId)
    .select()
    .single();
  if (error) throw error;
  return categoryFromDb(data as DbFinanceCategory);
}

export async function deleteCategory(
  supabase: SupabaseClient,
  profileId: string,
  categoryId: string,
): Promise<void> {
  const usage = await getCategoryUsage(supabase, profileId, categoryId);
  if (usage.total > 0) {
    throw new Error(
      `Kategori masih dipakai (${usage.transactions} transaksi, ${usage.subscriptions} langganan, ${usage.budgetLimits} budget). Hapus atau pindahkan dulu.`,
    );
  }
  const { error } = await supabase
    .from("finance_categories")
    .delete()
    .eq("id", categoryId)
    .eq("profile_id", profileId);
  if (error) throw error;
}

export async function reorderCategories(
  supabase: SupabaseClient,
  profileId: string,
  orderedIds: string[],
): Promise<FinanceCategory[]> {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("finance_categories")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("profile_id", profileId),
  );
  const results = await Promise.all(updates);
  const err = results.find((r) => r.error)?.error;
  if (err) throw err;

  const { data, error } = await supabase
    .from("finance_categories")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order");
  if (error) throw error;
  return dedupeCategories(
    (data as DbFinanceCategory[]).map(categoryFromDb),
  );
}

export async function createImportJob(
  supabase: SupabaseClient,
  profileId: string,
  input: {
    source: FinanceImportJob["source"];
    storagePath: string;
    fileUrl: string;
    originalFilename: string;
    status?: FinanceImportJob["status"];
    extractedCount?: number;
    errorMessage?: string;
    previewJson?: unknown;
  },
): Promise<FinanceImportJob> {
  const { data, error } = await supabase
    .from("finance_import_jobs")
    .insert({
      profile_id: profileId,
      source: input.source,
      storage_path: input.storagePath,
      file_url: input.fileUrl,
      original_filename: input.originalFilename,
      status: input.status ?? "pending",
      extracted_count: input.extractedCount ?? 0,
      error_message: input.errorMessage ?? null,
      preview_json: input.previewJson ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return importJobFromDb(data as DbFinanceImportJob);
}

export async function updateImportJob(
  supabase: SupabaseClient,
  jobId: string,
  patch: Partial<{
    status: FinanceImportJob["status"];
    extractedCount: number;
    errorMessage: string | null;
    previewJson: unknown;
    completedAt: string | null;
  }>,
): Promise<FinanceImportJob> {
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.status) row.status = patch.status;
  if (patch.extractedCount !== undefined) {
    row.extracted_count = patch.extractedCount;
  }
  if (patch.errorMessage !== undefined) row.error_message = patch.errorMessage;
  if (patch.previewJson !== undefined) row.preview_json = patch.previewJson;
  if (patch.completedAt !== undefined) row.completed_at = patch.completedAt;

  const { data, error } = await supabase
    .from("finance_import_jobs")
    .update(row)
    .eq("id", jobId)
    .select()
    .single();
  if (error) throw error;
  return importJobFromDb(data as DbFinanceImportJob);
}

export async function deleteImportJob(
  supabase: SupabaseClient,
  job: FinanceImportJob,
): Promise<void> {
  if (job.storagePath) {
    const { removeFinanceImportFile } = await import("./finance-import-storage");
    await removeFinanceImportFile(supabase, job.storagePath).catch(() => {});
  }
  const { error } = await supabase
    .from("finance_import_jobs")
    .delete()
    .eq("id", job.id);
  if (error) throw error;
}

export { resolveProfileId, toISODate };
