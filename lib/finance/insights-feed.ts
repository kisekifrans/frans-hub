import type { BudgetUsage } from "@/lib/finance/types";
import type {
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTransaction,
} from "@/lib/finance/types";
import { formatMoney } from "@/lib/finance/format";

export type FeedInsightTone = "positive" | "neutral" | "attention";

export type FeedInsight = {
  id: string;
  emoji: string;
  message: string;
  /** Short label e.g. "Budget", "Minggu ini" */
  tag?: string;
  tone: FeedInsightTone;
  priority: number;
};

const ID_MERCHANT_HINTS: { pattern: RegExp; label: string; emoji: string }[] = [
  { pattern: /gopay|gojek|go-food|gofood/i, label: "GoPay", emoji: "🟢" },
  { pattern: /ovo/i, label: "OVO", emoji: "🟣" },
  { pattern: /dana\b/i, label: "DANA", emoji: "🔵" },
  { pattern: /shopee|spay|shopeepay/i, label: "ShopeePay", emoji: "🧡" },
  { pattern: /tokopedia|tokped/i, label: "Tokopedia", emoji: "🛒" },
  { pattern: /qris/i, label: "QRIS", emoji: "📱" },
  { pattern: /indomaret|indomart/i, label: "Indomaret", emoji: "🏪" },
  { pattern: /alfamart|alfamidi/i, label: "Alfamart", emoji: "🛒" },
  { pattern: /warung|warkop/i, label: "warung", emoji: "🍜" },
  { pattern: /grab|gojek/i, label: "ojek", emoji: "🛵" },
  { pattern: /coffee|kopi|starbucks|janji\s*jiwa/i, label: "kopi", emoji: "☕" },
  { pattern: /shopeefood|gofood|grabfood/i, label: "food delivery", emoji: "🍱" },
];

const TONE_PRIORITY: Record<FeedInsightTone, number> = {
  attention: 0,
  positive: 1,
  neutral: 2,
};

function textOf(t: FinanceTransaction): string {
  return `${t.title} ${t.description} ${t.notes ?? ""}`.toLowerCase();
}

function weekExpenses(transactions: FinanceTransaction[]): FinanceTransaction[] {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  return transactions.filter(
    (t) =>
      t.type === "expense" &&
      t.transactionDate >= from &&
      t.transactionDate <= to,
  );
}

function sumCategory(
  txs: FinanceTransaction[],
  categories: FinanceCategory[],
  nameMatch: RegExp,
): number {
  const catIds = categories
    .filter((c) => nameMatch.test(c.name))
    .map((c) => c.id);
  return txs
    .filter((t) => t.categoryId && catIds.includes(t.categoryId))
    .reduce((s, t) => s + t.amount, 0);
}

function push(
  list: FeedInsight[],
  item: Omit<FeedInsight, "priority"> & { priority?: number },
) {
  list.push({
    ...item,
    priority: item.priority ?? TONE_PRIORITY[item.tone],
  });
}

/**
 * Lifestyle micro-insights for the finance feed (Indonesia-first, non-judgmental).
 */
export function buildFinancialFeed(input: {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  paymentMethods?: FinancePaymentMethod[];
  budgetUsage: BudgetUsage[];
  periodLabel?: string;
}): FeedInsight[] {
  const {
    transactions,
    categories,
    paymentMethods = [],
    budgetUsage,
    periodLabel,
  } = input;
  const insights: FeedInsight[] = [];
  const week = weekExpenses(transactions);

  for (const u of budgetUsage) {
    const left = Math.max(0, 100 - u.percent);
    if (u.status === "over") {
      push(insights, {
        id: `budget-over-${u.categoryId}`,
        emoji: u.icon,
        tag: "Budget",
        message: `${u.categoryName} sudah melewati limit periode ini`,
        tone: "attention",
        priority: -1,
      });
    } else if (u.status === "warning" && left > 0 && left <= 30) {
      push(insights, {
        id: `budget-${u.categoryId}`,
        emoji: u.icon,
        tag: "Budget",
        message: `Budget ${u.categoryName.toLowerCase()} tinggal ${left.toFixed(0)}%`,
        tone: "attention",
      });
    } else if (u.status === "ok" && u.percent > 0 && u.percent < 45) {
      push(insights, {
        id: `budget-ok-${u.categoryId}`,
        emoji: "✨",
        tag: "Budget",
        message: `${u.categoryName} masih santai — ${left.toFixed(0)}% tersisa`,
        tone: "positive",
      });
    }
  }

  const food = sumCategory(
    week,
    categories,
    /makan|food|kuliner|restoran|delivery/i,
  );
  const foodAlt = week
    .filter((t) => /makan|food|gofood|shopeefood|grabfood|warung/i.test(textOf(t)))
    .reduce((s, t) => s + t.amount, 0);
  const foodTotal = Math.max(food, foodAlt);
  if (foodTotal >= 150_000) {
    push(insights, {
      id: "food-week",
      emoji: "🍜",
      tag: "Minggu ini",
      message: `${formatMoney(foodTotal)} untuk makan & kuliner minggu ini`,
      tone: "neutral",
    });
  }

  const coffee = sumCategory(week, categories, /kopi|coffee|minuman/i);
  const coffeeAlt = week
    .filter((t) => /kopi|coffee/i.test(textOf(t)))
    .reduce((s, t) => s + t.amount, 0);
  const coffeeTotal = Math.max(coffee, coffeeAlt);
  if (coffeeTotal >= 50_000) {
    push(insights, {
      id: "coffee-week",
      emoji: "☕",
      tag: "Minggu ini",
      message: `${formatMoney(coffeeTotal)} untuk kopi minggu ini`,
      tone: "neutral",
    });
  }

  if (paymentMethods.length && week.length) {
    const pmMap = new Map(paymentMethods.map((m) => [m.id, m]));
    const pmSpend = new Map<string, number>();
    for (const t of week) {
      if (!t.paymentMethodId) continue;
      const name = pmMap.get(t.paymentMethodId)?.name ?? "";
      pmSpend.set(name, (pmSpend.get(name) ?? 0) + t.amount);
    }
    const topPm = [...pmSpend.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topPm && topPm[1] >= 100_000) {
      const isEwallet = /gopay|ovo|dana|shopee|qris/i.test(topPm[0]);
      push(insights, {
        id: "pm-top",
        emoji: isEwallet ? "💳" : "🏦",
        tag: "Pembayaran",
        message: `Mayoritas pakai ${topPm[0]} minggu ini`,
        tone: "neutral",
      });
    }
  }

  const transport = sumCategory(
    week,
    categories,
    /transport|ojek|grab|gojek|bensin|parkir/i,
  );
  if (transport > 0) {
    const prevStart = new Date();
    prevStart.setDate(prevStart.getDate() - 13);
    const prevEnd = new Date();
    prevEnd.setDate(prevEnd.getDate() - 7);
    const prevFrom = prevStart.toISOString().slice(0, 10);
    const prevTo = prevEnd.toISOString().slice(0, 10);
    const prevTransport = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.transactionDate >= prevFrom &&
          t.transactionDate <= prevTo &&
          t.categoryId &&
          categories.some(
            (c) =>
              /transport|ojek|grab|gojek|bensin|parkir/i.test(c.name) &&
              c.id === t.categoryId,
          ),
      )
      .reduce((s, t) => s + t.amount, 0);

    if (prevTransport > 0 && transport < prevTransport * 0.85) {
      const pct = Math.round((1 - transport / prevTransport) * 100);
      push(insights, {
        id: "transport-down",
        emoji: "🛵",
        tag: "Trend",
        message: `Transport turun ~${pct}% vs minggu lalu`,
        tone: "positive",
      });
    }
  }

  const weekend = week.filter((t) => {
    const d = new Date(t.transactionDate).getDay();
    return d === 0 || d === 6;
  });
  const weekday = week.filter((t) => {
    const d = new Date(t.transactionDate).getDay();
    return d >= 1 && d <= 5;
  });
  const weekendSum = weekend.reduce((s, t) => s + t.amount, 0);
  const weekdaySum = weekday.reduce((s, t) => s + t.amount, 0);
  if (weekendSum > weekdaySum * 1.35 && weekend.length >= 2 && weekdaySum > 0) {
    push(insights, {
      id: "weekend-spike",
      emoji: "🌙",
      tag: "Pola",
      message: "Pengeluaran cenderung naik di akhir pekan",
      tone: "neutral",
    });
  }

  const merchantCounts = new Map<string, { amount: number; emoji: string }>();
  for (const t of week) {
    const blob = textOf(t);
    for (const { pattern, label, emoji } of ID_MERCHANT_HINTS) {
      if (pattern.test(blob)) {
        const cur = merchantCounts.get(label) ?? { amount: 0, emoji };
        merchantCounts.set(label, {
          amount: cur.amount + t.amount,
          emoji,
        });
      }
    }
  }
  const topMerchant = [...merchantCounts.entries()].sort(
    (a, b) => b[1].amount - a[1].amount,
  )[0];
  if (topMerchant && topMerchant[1].amount >= 80_000) {
    push(insights, {
      id: "merchant-top",
      emoji: topMerchant[1].emoji,
      tag: "Lokal",
      message: `Banyak lewat ${topMerchant[0]} minggu ini`,
      tone: "neutral",
    });
  }

  const periodExpenses = transactions.filter((t) => t.type === "expense");
  const periodIncome = transactions.filter((t) => t.type === "income");
  const expSum = periodExpenses.reduce((s, t) => s + t.amount, 0);
  const incSum = periodIncome.reduce((s, t) => s + t.amount, 0);

  if (incSum > 0 && expSum < incSum) {
    const saved = ((incSum - expSum) / incSum) * 100;
    if (saved >= 8) {
      push(insights, {
        id: "saved-pct",
        emoji: "🌱",
        tag: periodLabel ?? "Periode",
        message: `Kamu menyisihkan ~${saved.toFixed(0)}% dari pemasukan`,
        tone: "positive",
        priority: 0,
      });
    }
  }

  const byCat = new Map<string, { name: string; icon: string; total: number }>();
  for (const t of periodExpenses) {
    if (!t.categoryId) continue;
    const cat = categories.find((c) => c.id === t.categoryId);
    const key = t.categoryId;
    const cur = byCat.get(key) ?? {
      name: cat?.name ?? "Lainnya",
      icon: cat?.icon ?? "📦",
      total: 0,
    };
    cur.total += t.amount;
    byCat.set(key, cur);
  }
  const topCat = [...byCat.values()].sort((a, b) => b.total - a.total)[0];
  if (topCat && topCat.total >= 200_000 && periodExpenses.length >= 3) {
    push(insights, {
      id: "top-category",
      emoji: topCat.icon,
      tag: "Fokus",
      message: `Terbesar: ${topCat.name} (${formatMoney(topCat.total)})`,
      tone: "neutral",
    });
  }

  if (insights.length === 0) {
    push(insights, {
      id: "empty",
      emoji: "✨",
      tag: "Mulai",
      message: "Tambah transaksi — insight personal akan muncul di sini",
      tone: "neutral",
    });
  }

  return insights
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
    .slice(0, 6);
}
