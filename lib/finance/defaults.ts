import type {
  FinanceCategory,
  FinancePaymentMethod,
  FinancePaymentMethodType,
} from "@/lib/finance/types";

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

type DefaultPayment = Omit<
  FinancePaymentMethod,
  "id" | "order" | "isFavorite"
>;

export const DEFAULT_PAYMENT_METHODS: DefaultPayment[] = [
  { name: "Cash", icon: "💵", color: "#22c55e", type: "cash", isDefault: true },
  { name: "BCA", icon: "🏦", color: "#3b82f6", type: "bank", isDefault: true },
  { name: "GoPay", icon: "🟢", color: "#22c55e", type: "ewallet", isDefault: true },
  { name: "OVO", icon: "🟣", color: "#8b5cf6", type: "ewallet", isDefault: true },
  { name: "DANA", icon: "🔵", color: "#0ea5e9", type: "ewallet", isDefault: true },
  {
    name: "ShopeePay",
    icon: "🟠",
    color: "#f97316",
    type: "ewallet",
    isDefault: true,
  },
  { name: "QRIS", icon: "📱", color: "#06b6d4", type: "card", isDefault: true },
  {
    name: "Steam Wallet",
    icon: "🎮",
    color: "#8b5cf6",
    type: "ewallet",
    isDefault: true,
  },
  { name: "Crypto", icon: "₿", color: "#71717a", type: "crypto", isDefault: true },
];

export function defaultPaymentMethodType(
  name: string,
): FinancePaymentMethodType {
  const n = name.toLowerCase();
  if (n === "cash") return "cash";
  if (n === "bca" || n.includes("bank")) return "bank";
  if (n === "crypto" || n === "btc") return "crypto";
  if (n === "qris") return "card";
  if (
    ["gopay", "ovo", "dana", "shopeepay", "steam wallet"].includes(n) ||
    n.includes("pay")
  ) {
    return "ewallet";
  }
  return "other";
}
