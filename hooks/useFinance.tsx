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
import {
  computePaymentMethodUsageCounts,
  sortPaymentMethodsForPicker,
} from "@/lib/finance/payment-methods";
import { findPeriodForDate } from "@/lib/finance/periods";
import { toISODate } from "@/lib/finance/format";
import type {
  FinanceCategory,
  FinanceCategoryType,
  FinanceFilters,
  FinancePaymentMethod,
  FinancePaymentMethodType,
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
import {
  pdfImportUserErrorMessage,
  validatePdfMagic,
} from "@/lib/security/upload-validation";
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
  purgeFinanceImportPdf,
  fetchFinanceData,
  createPaymentMethod,
  deletePaymentMethod,
  reorderCategories,
  reorderPaymentMethods,
  setPaymentMethodFavorite,
  updateCategory,
  updatePaymentMethod,
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
  addPaymentMethod: (input: {
    name: string;
    icon: string;
    color: string;
    type: FinancePaymentMethodType;
  }) => Promise<void>;
  savePaymentMethod: (method: FinancePaymentMethod) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  movePaymentMethod: (id: string, direction: "up" | "down") => Promise<void>;
  togglePaymentMethodFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  paymentMethodUsageCounts: Map<string, number>;
  paymentMethodsForPicker: FinancePaymentMethod[];
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

  const paymentMethodUsageCounts = useMemo(
    () =>
      data
        ? computePaymentMethodUsageCounts(
            data.transactions,
            data.subscriptions,
          )
        : new Map<string, number>(),
    [data],
  );

  const paymentMethodsForPicker = useMemo(() => {
    if (!data) return [];
    return sortPaymentMethodsForPicker(
      data.paymentMethods,
      paymentMethodUsageCounts,
    );
  }, [data, paymentMethodUsageCounts]);

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
        await deleteTransaction(supabase, data.profileId, id);
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
        const saved = await updatePeriod(supabase, data.profileId, {
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
        const saved = await updateSubscription(supabase, data.profileId, sub);
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
    if (!data) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await deleteSubscription(supabase, data.profileId, id);
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
  }, [data]);

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

  const addPaymentMethod = useCallback(
    async (input: {
      name: string;
      icon: string;
      color: string;
      type: FinancePaymentMethodType;
    }) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const created = await createPaymentMethod(
          supabase,
          data.profileId,
          input,
        );
        setData((d) =>
          d
            ? { ...d, paymentMethods: [...d.paymentMethods, created] }
            : d,
        );
        toast.success("Metode pembayaran ditambahkan");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Gagal menambah metode pembayaran",
        );
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const savePaymentMethod = useCallback(
    async (method: FinancePaymentMethod) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const saved = await updatePaymentMethod(
          supabase,
          data.profileId,
          method,
        );
        setData((d) =>
          d
            ? {
                ...d,
                paymentMethods: d.paymentMethods.map((m) =>
                  m.id === saved.id ? saved : m,
                ),
              }
            : d,
        );
        toast.success("Metode pembayaran disimpan");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Gagal menyimpan metode pembayaran",
        );
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const removePaymentMethod = useCallback(
    async (id: string) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        await deletePaymentMethod(supabase, data.profileId, id);
        setData((d) =>
          d
            ? {
                ...d,
                paymentMethods: d.paymentMethods.filter((m) => m.id !== id),
              }
            : d,
        );
        toast.success("Metode pembayaran dihapus");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Gagal menghapus metode pembayaran",
        );
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const movePaymentMethod = useCallback(
    async (id: string, direction: "up" | "down") => {
      if (!data) return;
      const sorted = [...data.paymentMethods].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((m) => m.id === id);
      if (idx < 0) return;
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sorted.length) return;
      const next = [...sorted];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      setSaving(true);
      try {
        const supabase = createClient();
        const reordered = await reorderPaymentMethods(
          supabase,
          data.profileId,
          next.map((m) => m.id),
        );
        setData((d) => (d ? { ...d, paymentMethods: reordered } : d));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal mengurutkan");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  const togglePaymentMethodFavorite = useCallback(
    async (id: string, isFavorite: boolean) => {
      if (!data) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const saved = await setPaymentMethodFavorite(
          supabase,
          data.profileId,
          id,
          isFavorite,
        );
        setData((d) =>
          d
            ? {
                ...d,
                paymentMethods: d.paymentMethods.map((m) =>
                  m.id === saved.id ? saved : m,
                ),
              }
            : d,
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal memperbarui favorit");
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
      const pdfError = await validatePdfMagic(file);
      if (pdfError) {
        toast.error(pdfError);
        return null;
      }

      setSaving(true);
      const supabase = createClient();
      let storagePath: string | null = null;
      let jobId: string | null = null;
      let storagePurged = false;

      const syncFailedJob = (updated: FinanceImportJob) => {
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
      };

      try {
        onProgress?.(5);

        const uploaded = await uploadFinanceImportPdf(
          supabase,
          data.profileId,
          file,
          (p) => onProgress?.(Math.min(p, 45)),
        );
        storagePath = uploaded.storagePath;

        const job = await createImportJob(supabase, data.profileId, {
          source,
          storagePath: uploaded.storagePath,
          fileUrl: uploaded.fileUrl,
          originalFilename: file.name,
          status: "processing",
        });
        jobId = job.id;

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
        const parsed = parseStatementText(finalText, source);
        const rows = buildPreviewRows(
          parsed.transactions,
          source,
          data.categories,
          data.paymentMethods,
          data.periods,
        );

        const noRowsMessage =
          parsed.errors[0] ?? "No transactions found in this PDF.";
        const updated = await updateImportJob(supabase, data.profileId, job.id, {
          status: rows.length > 0 ? "processing" : "failed",
          extractedCount: rows.length,
          errorMessage: rows.length === 0 ? noRowsMessage : null,
          previewJson: rows,
        });

        await purgeFinanceImportPdf(supabase, storagePath);
        storagePurged = true;
        syncFailedJob(updated);

        onProgress?.(100);

        if (rows.length === 0) {
          toast.error(noRowsMessage);
        }

        return { job: updated, rows, errors: parsed.errors };
      } catch (e) {
        console.error("[finance-import] process failed", e);
        const message = pdfImportUserErrorMessage(e);
        if (jobId) {
          try {
            const failed = await updateImportJob(
              supabase,
              data.profileId,
              jobId,
              { status: "failed", errorMessage: message },
            );
            syncFailedJob(failed);
          } catch (updateErr) {
            console.error("[finance-import] failed to mark job", updateErr);
          }
        }
        toast.error(message);
        return null;
      } finally {
        if (storagePath && !storagePurged) {
          await purgeFinanceImportPdf(supabase, storagePath);
        }
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

        const updated = await updateImportJob(supabase, data.profileId, jobId, {
          status: "completed",
          extractedCount: created.length,
          completedAt: new Date().toISOString(),
          previewJson: rows,
        });

        const jobRow = data.importJobs.find((j) => j.id === jobId);
        if (jobRow?.storagePath) {
          await purgeFinanceImportPdf(supabase, jobRow.storagePath);
        }

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
        await deleteImportJob(supabase, data.profileId, job);
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
      const supabase = createClient();
      const storagePath = job.storagePath;
      let storagePurged = false;

      try {
        onProgress?.(10);
        const blob = await downloadFinanceImportPdf(supabase, storagePath);
        const file = new File(
          [blob],
          job.originalFilename ?? "statement.pdf",
          { type: "application/pdf" },
        );
        const pdfError = await validatePdfMagic(file);
        if (pdfError) {
          toast.error(pdfError);
          const failed = await updateImportJob(
            supabase,
            data.profileId,
            jobId,
            { status: "failed", errorMessage: pdfError },
          );
          setData((d) =>
            d
              ? {
                  ...d,
                  importJobs: d.importJobs.map((j) =>
                    j.id === jobId ? failed : j,
                  ),
                }
              : d,
          );
          return null;
        }
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
        const noRowsMessage =
          parsed.errors[0] ?? "No transactions found in this PDF.";
        const updated = await updateImportJob(supabase, data.profileId, jobId, {
          status: rows.length > 0 ? "processing" : "failed",
          extractedCount: rows.length,
          errorMessage: rows.length === 0 ? noRowsMessage : null,
          previewJson: rows,
        });
        await purgeFinanceImportPdf(supabase, storagePath);
        storagePurged = true;
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
        if (rows.length === 0) {
          toast.error(noRowsMessage);
        }
        return { job: updated, rows, errors: parsed.errors };
      } catch (e) {
        console.error("[finance-import] retry failed", e);
        const message = pdfImportUserErrorMessage(e);
        try {
          const failed = await updateImportJob(
            supabase,
            data.profileId,
            jobId,
            { status: "failed", errorMessage: message },
          );
          setData((d) =>
            d
              ? {
                  ...d,
                  importJobs: d.importJobs.map((j) =>
                    j.id === jobId ? failed : j,
                  ),
                }
              : d,
          );
        } catch (updateErr) {
          console.error("[finance-import] failed to mark job on retry", updateErr);
        }
        toast.error(message);
        return null;
      } finally {
        if (!storagePurged) {
          await purgeFinanceImportPdf(supabase, storagePath);
        }
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
    addPaymentMethod,
    savePaymentMethod,
    removePaymentMethod,
    movePaymentMethod,
    togglePaymentMethodFavorite,
    paymentMethodUsageCounts,
    paymentMethodsForPicker,
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
