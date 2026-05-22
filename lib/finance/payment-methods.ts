import type {
  FinancePaymentMethod,
  FinancePaymentMethodType,
  FinanceSubscription,
  FinanceTransaction,
} from "@/lib/finance/types";

export const PAYMENT_METHOD_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#71717a",
  "#eab308",
];

/** First emoji/grapheme for payment method icon field. */
export function normalizePaymentEmoji(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "💳";
  const parts = [...trimmed];
  return parts[0] ?? "💳";
}

export function paymentMethodTypeLabel(
  type: FinancePaymentMethodType,
): string {
  const labels: Record<FinancePaymentMethodType, string> = {
    cash: "Cash",
    bank: "Bank",
    ewallet: "E-Wallet",
    crypto: "Crypto",
    card: "Card",
    other: "Other",
  };
  return labels[type];
}

export function computePaymentMethodUsageCounts(
  transactions: FinanceTransaction[],
  subscriptions: FinanceSubscription[] = [],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (!t.paymentMethodId) continue;
    map.set(t.paymentMethodId, (map.get(t.paymentMethodId) ?? 0) + 1);
  }
  for (const s of subscriptions) {
    if (!s.paymentMethodId) continue;
    map.set(s.paymentMethodId, (map.get(s.paymentMethodId) ?? 0) + 1);
  }
  return map;
}

export function sortPaymentMethodsForPicker(
  methods: FinancePaymentMethod[],
  usageCounts: Map<string, number>,
): FinancePaymentMethod[] {
  return [...methods].sort((a, b) => {
    const favDiff = Number(b.isFavorite) - Number(a.isFavorite);
    if (favDiff !== 0) return favDiff;
    const usageDiff =
      (usageCounts.get(b.id) ?? 0) - (usageCounts.get(a.id) ?? 0);
    if (usageDiff !== 0) return usageDiff;
    const orderDiff = a.order - b.order;
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  });
}

const LABEL_ALIASES: Record<string, string[]> = {
  gopay: ["gopay", "gopaylater", "gopay coins", "go pay"],
  ovo: ["ovo"],
  dana: ["dana"],
  shopeepay: ["shopeepay", "shopee pay"],
  bca: ["bca"],
  cash: ["cash", "tunai"],
  qris: ["qris"],
  "steam wallet": ["steam wallet", "steam"],
  crypto: ["crypto", "bitcoin", "btc"],
};

/** Match import labels (e.g. GoPayLater) to a configured method. */
export function resolvePaymentMethodFromLabel(
  label: string | undefined,
  methods: FinancePaymentMethod[],
  fallback?: FinancePaymentMethod,
): FinancePaymentMethod | undefined {
  if (!label?.trim()) return fallback;

  const norm = label.trim().toLowerCase();
  const exact = methods.find((m) => m.name.toLowerCase() === norm);
  if (exact) return exact;

  for (const m of methods) {
    const aliases = LABEL_ALIASES[m.name.toLowerCase()] ?? [m.name.toLowerCase()];
    if (aliases.some((a) => norm.includes(a) || a.includes(norm))) return m;
  }

  if (/gopay/i.test(label)) {
    return methods.find((m) => m.name.toLowerCase() === "gopay") ?? fallback;
  }
  if (/ovo/i.test(label)) return methods.find((m) => m.name.toLowerCase() === "ovo") ?? fallback;
  if (/dana/i.test(label)) return methods.find((m) => m.name.toLowerCase() === "dana") ?? fallback;
  if (/shopee/i.test(label)) {
    return methods.find((m) => m.name.toLowerCase() === "shopeepay") ?? fallback;
  }

  return fallback;
}
