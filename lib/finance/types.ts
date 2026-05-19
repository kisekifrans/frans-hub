export type FinanceTransactionType = "income" | "expense";
export type FinanceCategoryType = "income" | "expense" | "both";
export type BillingCycle = "weekly" | "monthly" | "yearly";
export type ImportSource = "gopay" | "bank" | "shopeepay" | "other";
export type ImportJobStatus = "pending" | "processing" | "completed" | "failed";

export type FinanceDatePreset =
  | "today"
  | "week"
  | "month"
  | "period"
  | "custom";

export interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: FinanceCategoryType;
  order: number;
  isDefault?: boolean;
}

export interface CategoryUsageInfo {
  transactions: number;
  subscriptions: number;
  budgetLimits: number;
  total: number;
}

export interface FinancePaymentMethod {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface FinanceBudgetPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  salaryReceived: number | null;
  notes?: string;
}

export interface FinanceBudgetLimit {
  id: string;
  categoryId: string;
  periodId: string;
  limitAmount: number;
  warningThreshold: number;
}

export interface FinanceTransaction {
  id: string;
  type: FinanceTransactionType;
  title: string;
  description: string;
  amount: number;
  currency: string;
  categoryId?: string;
  paymentMethodId?: string;
  transactionDate: string;
  periodId?: string;
  recurring: boolean;
  tags: string[];
  attachmentUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface FinanceSubscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  categoryId?: string;
  paymentMethodId?: string;
  autoRenew: boolean;
  active: boolean;
  notes?: string;
}

export interface FinanceImportJob {
  id: string;
  source: ImportSource;
  fileUrl?: string;
  storagePath?: string;
  originalFilename?: string;
  status: ImportJobStatus;
  errorMessage?: string;
  extractedCount: number;
  createdAt: string;
  completedAt?: string;
}

export interface BudgetUsage {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  limitAmount: number;
  spent: number;
  remaining: number;
  percent: number;
  warningThreshold: number;
  status: "ok" | "warning" | "over";
}

export interface FinanceDashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgetUsedPercent: number;
  subscriptionMonthlyTotal: number;
  largestExpenseCategory: string | null;
  daysRemainingInPeriod: number;
  dailyAverageSpending: number;
}

export interface FinanceFilters {
  preset: FinanceDatePreset;
  dateFrom?: string;
  dateTo?: string;
  periodId?: string;
  categoryId?: string;
  paymentMethodId?: string;
  type?: FinanceTransactionType | "all";
  search?: string;
}

export interface FinancePageData {
  profileId: string;
  categories: FinanceCategory[];
  paymentMethods: FinancePaymentMethod[];
  periods: FinanceBudgetPeriod[];
  limits: FinanceBudgetLimit[];
  transactions: FinanceTransaction[];
  subscriptions: FinanceSubscription[];
  importJobs: FinanceImportJob[];
}
