import type { FinanceCategory, FinancePaymentMethod } from "@/lib/finance/types";

export const DEFAULT_EXPENSE_CATEGORIES: Omit<
  FinanceCategory,
  "id" | "order"
>[] = [
  { name: "Food", icon: "🍔", color: "#f97316", type: "expense" },
  { name: "Drinks", icon: "🥤", color: "#06b6d4", type: "expense" },
  { name: "Steam / Gaming", icon: "🎮", color: "#8b5cf6", type: "expense" },
  { name: "Subscription", icon: "💳", color: "#ec4899", type: "expense" },
  { name: "Transport", icon: "🚕", color: "#3b82f6", type: "expense" },
  { name: "Shopping", icon: "🛍️", color: "#a855f7", type: "expense" },
  { name: "Rent", icon: "🏠", color: "#64748b", type: "expense" },
  { name: "Internet", icon: "📶", color: "#0ea5e9", type: "expense" },
  { name: "Investment", icon: "📈", color: "#10b981", type: "both" },
  { name: "Other", icon: "📦", color: "#71717a", type: "expense" },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<
  FinanceCategory,
  "id" | "order"
>[] = [
  { name: "Salary", icon: "💰", color: "#22c55e", type: "income" },
  { name: "Steam Trading", icon: "🎮", color: "#8b5cf6", type: "income" },
  { name: "Freelance", icon: "💼", color: "#14b8a6", type: "income" },
  { name: "Other Income", icon: "✨", color: "#84cc16", type: "income" },
];

export const DEFAULT_PAYMENT_METHODS: Omit<
  FinancePaymentMethod,
  "id" | "order"
>[] = [
  { name: "Cash", icon: "💵" },
  { name: "BCA", icon: "🏦" },
  { name: "GoPay", icon: "🟢" },
  { name: "OVO", icon: "🟣" },
  { name: "Dana", icon: "🔵" },
  { name: "ShopeePay", icon: "🧡" },
  { name: "QRIS", icon: "📱" },
  { name: "Steam Wallet", icon: "🎮" },
  { name: "Crypto", icon: "₿" },
].map((m) => ({ ...m, order: 0 }));
