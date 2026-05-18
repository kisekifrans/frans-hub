"use client";

import { PeriodSelector } from "@/components/finance/shared/PeriodSelector";
import { TransactionFilters } from "@/components/finance/transactions/TransactionFilters";
import { TransactionList } from "@/components/finance/transactions/TransactionList";
import { useFinance } from "@/hooks/useFinance";

export default function FinanceTransactionsPage() {
  const finance = useFinance();
  if (!finance) return null;

  const { filteredTransactions } = finance;

  return (
    <div className="space-y-6">
      <PeriodSelector compact />
      <TransactionFilters />
      <TransactionList items={filteredTransactions} />
    </div>
  );
}
