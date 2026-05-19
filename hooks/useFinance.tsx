"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  computeDashboardStats,
  filterTransactions,
  resolveDateRange,
} from "@/lib/finance/analytics";
import { computeBudgetUsage } from "@/lib/finance/budget";
import {
  computeCategoryUsageCounts,
  sortCategoriesForPicker,
} from "@/lib/finance/categories";
import { findPeriodForDate } from "@/lib/finance/periods";
import { toISODate } from "@/lib/finance/format";
import type {
  FinanceCategory,
  FinanceCategoryType,
  FinanceFilters,
  FinanceImportJob,
  FinancePageData,
  FinanceSubscription,
  FinanceTransaction,
  FinanceBudgetLimit,
  FinanceTransactionType,
  ImportSource,
} from "@/lib/finance/types";
import type { ImportPreviewRow } from "@/lib/finance/import/types";
import { extractPdfWithMeta } from "@/lib/finance/import/extract-pdf";
import { FINANCE_PDF_MAX_BYTES } from "@/lib/finance/import/constants";
import { parseStatementText } from "@/lib/finance/import/parse-text";
import { buildPreviewRows } from "@/lib/finance/import/build-preview";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  uploadFinanceImportPdf,
  downloadFinanceImportPdf,
} from "@/lib/supabase/finance-import-storage";
import {
  createCategory,
  createImportJob,
  createSubscription,
  createTransaction,
  deleteCategory,
  deleteImportJob,
  deleteSubscription,
  deleteTransaction,
  fetchFinanceData,
  reorderCategories,
  updateCategory,
  updateImportJob,
  updatePeriod,
  updateSubscription,
  updateTransaction,
  upsertBudgetLimit,
} from "@/lib/supabase/finance-service";

type FinanceContextValue = FinancePageData & {
  loading: boolean;
  saving: boolean;
  currentPeriodId: string | null;
  setCurrentPeriodId: (id: string | null) => void;
  filters: FinanceFilters;
  setFilters: (f: FinanceFilters) => void;
  reload: () => Promise<void>;
  addTransaction: (
    input: Omit<FinanceTransaction, "id" | "createdAt">,
  ) => Promise<void>;
  saveTransaction: (item: FinanceTransaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  saveBudgetLimit: (limit: Omit<FinanceBudgetLimit, "id"> & { id?: string }) => Promise<void>;
  savePeriodSalary: (periodId: string, salary: number | null) => Promise<void>;
  addSubscription: (sub: Omit<FinanceSubscription, "id">) => Promise<void>;
  saveSubscription: (sub: FinanceSubscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  addCategory: (input: {
    name: string;
    icon: string;
    color: string;
    type: FinanceCategoryType;
  }) => Promise<void>;
  saveCategory: (category: FinanceCategory) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  moveCategory: (id: string, direction: "up" | "down") => Promise<void>;
  categoryUsageCounts: Map<string, number>;
  categoriesForType: (type: FinanceTransactionType) => FinanceCategory[];
  processPdfImport: (
    file: File,
    source: ImportSource,
    onProgress?: (n: number) => void,
  ) => Promise<{
    job: FinanceImportJob;
    rows: ImportPreviewRow[];
    errors: string[];
  } | null>;
  confirmPdfImport: (
    jobId: string,
    rows: ImportPreviewRow[],
  ) => Promise<void>;
  removeImportJob: (jobId: string) => Promise<void>;
  retryImportJob: (
    jobId: string,
    onProgress?: (n: number) => void,
  ) => Promise<{
    job: FinanceImportJob;
    rows: ImportPreviewRow[];
    errors: string[];
  } | null>;
  filteredTransactions: FinanceTransaction[];
  currentPeriod: FinancePageData["periods"][0] | undefined;
  budgetUsage: ReturnType<typeof computeBudgetUsage>;
  dashboardStats: ReturnType<typeof computeDashboardStats>;
};

const FinanceContext = createContext<FinanceContextValue | null | undefined>(
  undefined,
);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinancePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPeriodId, setCurrentPeriodId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FinanceFilters>({
    preset: "period",
    type: "all",
  });

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      toast.error("Supabase belum dikonfigurasi.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const page = await fetchFinanceData(supabase);
      setData(page);
      const current = findPeriodForDate(page.periods, toISODate());
      setCurrentPeriodId((prev) => prev ?? current?.id ?? page.periods[0]?.id ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat finance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const periods = data?.periods ?? [];
  const currentPeriod = periods.find((p) => p.id === currentPeriodId) ?? periods[0];

  const filtersWithPeriod = useMemo(() => {
    const range = resolveDateRange(
      { ...filters, periodId: currentPeriodId ?? filters.periodId },
      periods,
    );
    return {
      ...filters,
      periodId: filters.preset === "period" ? currentPeriodId ?? undefined : filters.periodId,
      dateFrom: range.from ?? filters.dateFrom,
      dateTo: range.to ?? filters.dateTo,
    };
  }, [filters, currentPeriodId, periods]);

  const filteredTransactions = useMemo(() => {
    if (!data) return [];
    return filterTransactions(data.transactions, filtersWithPeriod);
  }, [data, filtersWithPeriod]);

  const budgetUsage = useMemo(() => {
    if (!data || !currentPeriod) return [];
    return computeBudgetUsage(
      data.limits,
      data.categories,
      data.transactions,
      currentPeriod.id,
    );
  }, [data, currentPeriod]);

  const dashboardStats = useMemo(() => {
    if (!data) {
      return computeDashboardStats([], [], [], undefined, []);
    }
    return computeDashboardStats(
      data.transactions,
      data.limits,
      data.categories,
      currentPeriod,
      data.subscriptions,
    );
  }, [data, currentPeriod]);

  const categoryUsageCounts = useMemo(
    () =>
      data ? computeCategoryUsageCounts(data.transactions) : new Map<string, number>(),
    [data],
  );

  const categoriesForType = useCallback(
    (type: FinanceTransactionType) => {
      if (!data) return [];
      return sortCategoriesForPicker(
        data.categories,
        type,
        categoryUsageCounts,
      );
    },
    [data, categoryUsageCounts],
  );

  const addTransaction = useCallback(
    async (input: Omit<FinanceTransaction, "id" | "createdAt">) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const created = await createTransaction(
          supabase,
          data.profileId,
          input,
          data.periods,
        );
        setData((d) =>
          d ? { ...d, transactions: [created, ...d.transactions] } : d,
        );
        toast.success("Transaksi disimpan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const saveTransaction = useCallback(
    async (item: FinanceTransaction) => {
      if (!data) return;
      const period = findPeriodForDate(data.periods, item.transactionDate);
      const optimistic: FinanceTransaction = {
        ...item,
        periodId: period?.id ?? item.periodId,
      };
      const prev = data.transactions;
      setData((d) =>
        d
          ? {
              ...d,
              transactions: d.transactions.map((t) =>
                t.id === item.id ? optimistic : t,
              ),
            }
          : d,
      );
      setSaving(true);
      try {
        const supabase = createClient();
        const saved = await updateTransaction(
          supabase,
          data.profileId,
          item,
          data.periods,
        );
        setData((d) =>
          d
            ? {
                ...d,
                transactions: d.transactions.map((t) =>
                  t.id === saved.id ? saved : t,
                ),
              }
            : d,
        );
        toast.success("Transaksi diperbarui");
      } catch (e) {
        setData((d) => (d ? { ...d, transactions: prev } : d));
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const removeTransaction = useCallback(
    async (id: string) => {
      if (!data) return;
      const prev = data.transactions;
      setData((d) =>
        d
          ? { ...d, transactions: d.transactions.filter((t) => t.id !== id) }
          : d,
      );
      setSaving(true);
      try {
        const supabase = createClient();
        await deleteTransaction(supabase, id);
        toast.success("Transaksi dihapus");
      } catch (e) {
        setData((d) => (d ? { ...d, transactions: prev } : d));
        toast.error(e instanceof Error ? e.message : "Gagal menghapus");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const saveBudgetLimit = useCallback(
    async (limit: Omit<FinanceBudgetLimit, "id"> & { id?: string }) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const existing = data.limits.find(
          (l) =>
            l.periodId === limit.periodId && l.categoryId === limit.categoryId,
        );
        const saved = await upsertBudgetLimit(supabase, data.profileId, {
          ...limit,
          id: limit.id ?? existing?.id,
        });
        setData((d) => {
          if (!d) return d;
          const match = (l: (typeof d.limits)[0]) =>
            l.id === saved.id ||
            (l.periodId === saved.periodId &&
              l.categoryId === saved.categoryId);
          const exists = d.limits.some(match);
          return {
            ...d,
            limits: exists
              ? d.limits.map((l) => (match(l) ? saved : l))
              : [...d.limits, saved],
          };
        });
        toast.success("Budget disimpan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan budget");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const savePeriodSalary = useCallback(
    async (periodId: string, salary: number | null) => {
      if (!data) return;
      const period = data.periods.find((p) => p.id === periodId);
      if (!period) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const saved = await updatePeriod(supabase, {
          ...period,
          salaryReceived: salary,
        });
        setData((d) =>
          d
            ? {
                ...d,
                periods: d.periods.map((p) => (p.id === saved.id ? saved : p)),
              }
            : d,
        );
        toast.success("Gaji periode disimpan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const addSubscription = useCallback(
    async (sub: Omit<FinanceSubscription, "id">) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const created = await createSubscription(supabase, data.profileId, sub);
        setData((d) =>
          d ? { ...d, subscriptions: [...d.subscriptions, created] } : d,
        );
        toast.success("Subscription ditambahkan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const saveSubscription = useCallback(
    async (sub: FinanceSubscription) => {
      if (!data) return;
      const prev = data.subscriptions;
      setData((d) =>
        d
          ? {
              ...d,
              subscriptions: d.subscriptions.map((s) =>
                s.id === sub.id ? sub : s,
              ),
            }
          : d,
      );
      setSaving(true);
      try {
        const supabase = createClient();
        const saved = await updateSubscription(supabase, sub);
        setData((d) =>
          d
            ? {
                ...d,
                subscriptions: d.subscriptions.map((s) =>
                  s.id === saved.id ? saved : s,
                ),
              }
            : d,
        );
        toast.success("Subscription disimpan");
      } catch (e) {
        setData((d) => (d ? { ...d, subscriptions: prev } : d));
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const removeSubscription = useCallback(async (id: string) => {
    setSaving(true);
    try {
      const supabase = createClient();
      await deleteSubscription(supabase, id);
      setData((d) =>
        d
          ? { ...d, subscriptions: d.subscriptions.filter((s) => s.id !== id) }
          : d,
      );
      toast.success("Subscription dihapus");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setSaving(false);
    }
  }, []);

  const addCategory = useCallback(
    async (input: {
      name: string;
      icon: string;
      color: string;
      type: FinanceCategoryType;
    }) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const created = await createCategory(supabase, data.profileId, input);
        setData((d) =>
          d ? { ...d, categories: [...d.categories, created] } : d,
        );
        toast.success("Kategori ditambahkan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menambah kategori");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const saveCategory = useCallback(
    async (category: FinanceCategory) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const saved = await updateCategory(supabase, data.profileId, category);
        setData((d) =>
          d
            ? {
                ...d,
                categories: d.categories.map((c) =>
                  c.id === saved.id ? saved : c,
                ),
              }
            : d,
        );
        toast.success("Kategori disimpan");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menyimpan kategori");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        await deleteCategory(supabase, data.profileId, id);
        setData((d) =>
          d
            ? { ...d, categories: d.categories.filter((c) => c.id !== id) }
            : d,
        );
        toast.success("Kategori dihapus");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal menghapus kategori");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const moveCategory = useCallback(
    async (id: string, direction: "up" | "down") => {
      if (!data) return;
      const sorted = [...data.categories].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx < 0) return;
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sorted.length) return;
      const next = [...sorted];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      setSaving(true);
      try {
        const supabase = createClient();
        const reordered = await reorderCategories(
          supabase,
          data.profileId,
          next.map((c) => c.id),
        );
        setData((d) => (d ? { ...d, categories: reordered } : d));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal mengurutkan");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const processPdfImport = useCallback(
    async (
      file: File,
      source: ImportSource,
      onProgress?: (n: number) => void,
    ) => {
      if (!data) return null;
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        toast.error("Only PDF files are accepted");
        return null;
      }
      if (file.size > FINANCE_PDF_MAX_BYTES) {
        toast.error("Max file size is 25MB");
        return null;
      }

      setSaving(true);
      try {
        const supabase = createClient();
        onProgress?.(5);

        const { storagePath, fileUrl } = await uploadFinanceImportPdf(
          supabase,
          data.profileId,
          file,
          (p) => onProgress?.(Math.min(p, 45)),
        );

        const job = await createImportJob(supabase, data.profileId, {
          source,
          storagePath,
          fileUrl,
          originalFilename: file.name,
          status: "processing",
        });

        setData((d) =>
          d ? { ...d, importJobs: [job, ...d.importJobs] } : d,
        );

        onProgress?.(55);
        const extracted = await extractPdfWithMeta(file, (p) => {
          const base = 55;
          const span = 20;
          onProgress?.(base + Math.round(p.percent * span));
        });
        onProgress?.(75);

        const finalText = extracted.text;
        console.log("===== FINAL PARSED TEXT (hook → parser) =====");
        console.log(finalText);

        const parsed = parseStatementText(finalText, source);
        const rows = buildPreviewRows(
          parsed.transactions,
          source,
          data.categories,
          data.paymentMethods,
          data.periods,
        );

        const updated = await updateImportJob(supabase, job.id, {
          status: rows.length > 0 ? "processing" : "failed",
          extractedCount: rows.length,
          errorMessage:
            rows.length === 0
              ? parsed.errors[0] ?? "No transactions found"
              : null,
          previewJson: rows,
        });

        setData((d) =>
          d
            ? {
                ...d,
                importJobs: d.importJobs.map((j) =>
                  j.id === updated.id ? updated : j,
                ),
              }
            : d,
        );

        onProgress?.(100);
        console.log("[finance-import] parsed rows", rows.length);

        if (rows.length === 0) {
          toast.error(parsed.errors[0] ?? "No transactions found in PDF");
        }

        return { job: updated, rows, errors: parsed.errors };
      } catch (e) {
        console.error("[finance-import] process failed", e);
        toast.error(e instanceof Error ? e.message : "PDF import failed");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const confirmPdfImport = useCallback(
    async (jobId: string, rows: ImportPreviewRow[]) => {
      if (!data || rows.length === 0) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const created: FinanceTransaction[] = [];

        for (const row of rows) {
          if (!row.amount || row.amount <= 0) continue;
          const t = await createTransaction(
            supabase,
            data.profileId,
            {
              type: row.type,
              title: row.title || row.merchant,
              description: row.rawLine ?? "",
              amount: row.amount,
              currency: "IDR",
              categoryId: row.categoryId,
              paymentMethodId: row.paymentMethodId,
              transactionDate: row.transactionDate,
              periodId: row.periodId,
              recurring: false,
              tags: ["pdf-import"],
              notes: `Imported from ${row.merchant}`,
            },
            data.periods,
          );
          created.push(t);
        }

        const updated = await updateImportJob(supabase, jobId, {
          status: "completed",
          extractedCount: created.length,
          completedAt: new Date().toISOString(),
          previewJson: rows,
        });

        setData((d) =>
          d
            ? {
                ...d,
                transactions: [...created, ...d.transactions],
                importJobs: d.importJobs.map((j) =>
                  j.id === jobId ? updated : j,
                ),
              }
            : d,
        );

        toast.success(`Imported ${created.length} transactions`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Import failed");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const removeImportJob = useCallback(
    async (jobId: string) => {
      if (!data) return;
      const job = data.importJobs.find((j) => j.id === jobId);
      if (!job) return;
      setSaving(true);
      try {
        const supabase = createClient();
        await deleteImportJob(supabase, job);
        setData((d) =>
          d
            ? { ...d, importJobs: d.importJobs.filter((j) => j.id !== jobId) }
            : d,
        );
        toast.success("Import job deleted");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const retryImportJob = useCallback(
    async (jobId: string, onProgress?: (n: number) => void) => {
      if (!data) return null;
      const job = data.importJobs.find((j) => j.id === jobId);
      if (!job?.storagePath) {
        toast.error("No stored PDF for this job");
        return null;
      }
      setSaving(true);
      try {
        const supabase = createClient();
        onProgress?.(10);
        const blob = await downloadFinanceImportPdf(supabase, job.storagePath);
        const file = new File(
          [blob],
          job.originalFilename ?? "statement.pdf",
          { type: "application/pdf" },
        );
        onProgress?.(30);
        const extracted = await extractPdfWithMeta(file, (p) => {
          onProgress?.(30 + Math.round(p.percent * 40));
        });
        const parsed = parseStatementText(extracted.text, job.source);
        const rows = buildPreviewRows(
          parsed.transactions,
          job.source,
          data.categories,
          data.paymentMethods,
          data.periods,
        );
        const updated = await updateImportJob(supabase, jobId, {
          status: rows.length > 0 ? "processing" : "failed",
          extractedCount: rows.length,
          errorMessage:
            rows.length === 0
              ? parsed.errors[0] ?? "No transactions found"
              : null,
          previewJson: rows,
        });
        setData((d) =>
          d
            ? {
                ...d,
                importJobs: d.importJobs.map((j) =>
                  j.id === jobId ? updated : j,
                ),
              }
            : d,
        );
        onProgress?.(100);
        return { job: updated, rows, errors: parsed.errors };
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Retry failed");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const value: FinanceContextValue | null = !data
    ? null
    : {
    ...data,
    loading,
    saving,
    currentPeriodId,
    setCurrentPeriodId,
    filters,
    setFilters,
    reload: load,
    addTransaction,
    saveTransaction,
    removeTransaction,
    saveBudgetLimit,
    savePeriodSalary,
    addSubscription,
    saveSubscription,
    removeSubscription,
    addCategory,
    saveCategory,
    removeCategory,
    moveCategory,
    categoryUsageCounts,
    categoriesForType,
    processPdfImport,
    confirmPdfImport,
    removeImportJob,
    retryImportJob,
    filteredTransactions,
    currentPeriod,
    budgetUsage,
    dashboardStats,
      };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function FinanceLoadingGate({ children }: { children: React.ReactNode }) {
  const ctx = useContext(FinanceContext);
  if (ctx === undefined) {
    throw new Error("FinanceLoadingGate must be used within FinanceProvider");
  }
  if (!ctx) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }
  return <>{children}</>;
}

/** Returns finance context, or `null` while data is still loading. */
export function useFinance(): FinanceContextValue | null {
  const ctx = useContext(FinanceContext);
  if (ctx === undefined) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return ctx;
}

/** @deprecated Use useFinance() — same behavior. */
export function useFinanceOptional(): FinanceContextValue | null | undefined {
  return useContext(FinanceContext);
}
