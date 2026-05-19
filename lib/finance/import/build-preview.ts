import { suggestCategory } from "./category-matcher";
import { findPeriodForDate } from "@/lib/finance/periods";
import type { ImportPreviewRow, ParsedTransactionDraft } from "./types";
import type {
  FinanceBudgetPeriod,
  FinanceCategory,
  FinancePaymentMethod,
  ImportSource,
} from "@/lib/finance/types";

function paymentForSource(
  source: ImportSource,
  methods: FinancePaymentMethod[],
): FinancePaymentMethod | undefined {
  const name =
    source === "gopay"
      ? "GoPay"
      : source === "shopeepay"
        ? "ShopeePay"
        : source === "bank"
          ? "BCA"
          : "Cash";
  return methods.find((m) => m.name.toLowerCase() === name.toLowerCase());
}

function matchPaymentMethodId(
  label: string | undefined,
  methods: FinancePaymentMethod[],
  fallback?: FinancePaymentMethod,
): { id?: string; name?: string } {
  if (!label) {
    return { id: fallback?.id, name: fallback?.name };
  }
  const exact = methods.find(
    (m) => m.name.toLowerCase() === label.toLowerCase(),
  );
  if (exact) return { id: exact.id, name: exact.name };
  if (/gopay/i.test(label)) {
    const gp = methods.find((m) => m.name.toLowerCase() === "gopay");
    if (gp) return { id: gp.id, name: gp.name };
  }
  return { id: fallback?.id, name: label };
}

export function buildPreviewRows(
  drafts: ParsedTransactionDraft[],
  source: ImportSource,
  categories: FinanceCategory[],
  paymentMethods: FinancePaymentMethod[],
  periods: FinanceBudgetPeriod[] = [],
): ImportPreviewRow[] {
  const defaultPayment = paymentForSource(source, paymentMethods);

  return drafts.map((d) => {
    const cat = suggestCategory(d.merchant, d.type, categories, {
      service: d.service,
    });
    const pm = matchPaymentMethodId(
      d.paymentMethodLabel,
      paymentMethods,
      defaultPayment,
    );
    const period = periods.length
      ? findPeriodForDate(periods, d.transactionDate)
      : undefined;
    return {
      ...d,
      id: crypto.randomUUID(),
      categoryId: cat?.id,
      categoryName: cat?.name,
      categoryIcon: cat?.icon,
      categoryColor: cat?.color,
      periodId: period?.id,
      periodName: period?.name,
      paymentMethodId: pm.id,
      paymentMethodName: pm.name ?? d.paymentMethodLabel,
    };
  });
}
