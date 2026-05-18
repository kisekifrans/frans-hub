import { formatMoney } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

export function MoneyDisplay({
  amount,
  currency = "IDR",
  className,
  signed,
  type,
}: {
  amount: number;
  currency?: string;
  className?: string;
  signed?: boolean;
  type?: "income" | "expense";
}) {
  const prefix =
    signed && type === "income" ? "+" : signed && type === "expense" ? "−" : "";
  return (
    <span
      className={cn(
        "tabular-nums",
        type === "income" && "text-emerald-600 dark:text-emerald-400",
        type === "expense" && "text-rose-600 dark:text-rose-400",
        className,
      )}
    >
      {prefix}
      {formatMoney(amount, currency)}
    </span>
  );
}
