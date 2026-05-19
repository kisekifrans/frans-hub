import type { FinanceCategory } from "@/lib/finance/types";

/** Service substring → category name (checked first, case-insensitive) */
const SERVICE_RULES: { patterns: RegExp[]; categoryName: string }[] = [
  {
    patterns: [
      /gocar/i,
      /goride/i,
      /gojek/i,
      /taxi/i,
      /grabcar/i,
      /grabbike/i,
    ],
    categoryName: "Transport",
  },
  {
    patterns: [/gofood/i, /shopeefood/i, /grabfood/i],
    categoryName: "Food",
  },
];

const MERCHANT_DRINKS = [/coffee/i, /kopi/i, /starbucks/i];

const GAMING_KEYWORDS = [
  /steam/i,
  /valorant/i,
  /mlbb/i,
  /\bgame\b/i,
  /gaming/i,
];

const KEYWORD_RULES: { keywords: string[]; categoryName: string }[] = [
  {
    keywords: [
      "GOFOOD",
      "KFC",
      "MCD",
      "MCDONALD",
      "BURGER KING",
      "RESTO",
      "BAKMI",
      "WARTEG",
    ],
    categoryName: "Food",
  },
  {
    keywords: [
      "GOCAR",
      "GORIDE",
      "GOJEK",
      "GRAB",
      "BLUEBIRD",
      "TAXI",
      "TRANSPORT",
    ],
    categoryName: "Transport",
  },
  { keywords: ["STARBUCKS", "COFFEE", "KOPI"], categoryName: "Drinks" },
  {
    keywords: ["STEAM", "GAMING", "PLAYSTATION", "XBOX", "VALORANT", "MLBB"],
    categoryName: "Steam / Gaming",
  },
  {
    keywords: [
      "SPOTIFY",
      "NETFLIX",
      "YOUTUBE PREMIUM",
      "DISNEY",
      "SUBSCRIPTION",
    ],
    categoryName: "Subscription",
  },
  {
    keywords: ["SHOPEE", "TOKOPEDIA", "LAZADA", "SHOPPING"],
    categoryName: "Shopping",
  },
  {
    keywords: ["PLN", "PULSA", "INTERNET", "TELKOM", "INDIHOME"],
    categoryName: "Internet",
  },
  { keywords: ["SEWA", "RENT", "KOST"], categoryName: "Rent" },
  { keywords: ["GAJI", "SALARY", "PAYROLL"], categoryName: "Salary" },
  {
    keywords: ["TOP UP", "TOPUP", "TRANSFER MASUK", "TERIMA"],
    categoryName: "Other Income",
  },
];

function findCategoryByName(
  name: string,
  type: "income" | "expense",
  categories: FinanceCategory[],
): FinanceCategory | undefined {
  return categories.find(
    (c) =>
      c.name.toLowerCase() === name.toLowerCase() &&
      (c.type === type || c.type === "both"),
  );
}

function categoryFromService(
  service: string | undefined,
  type: "income" | "expense",
  categories: FinanceCategory[],
): FinanceCategory | undefined {
  if (!service?.trim()) return undefined;
  for (const rule of SERVICE_RULES) {
    if (rule.patterns.some((p) => p.test(service))) {
      return findCategoryByName(rule.categoryName, type, categories);
    }
  }
  return undefined;
}

function categoryFromMerchantDrinks(
  merchant: string,
  type: "income" | "expense",
  categories: FinanceCategory[],
): FinanceCategory | undefined {
  if (MERCHANT_DRINKS.some((p) => p.test(merchant))) {
    return findCategoryByName("Drinks", type, categories);
  }
  return undefined;
}

function categoryFromGaming(
  text: string,
  type: "income" | "expense",
  categories: FinanceCategory[],
): FinanceCategory | undefined {
  if (GAMING_KEYWORDS.some((p) => p.test(text))) {
    return findCategoryByName("Steam / Gaming", type, categories);
  }
  return undefined;
}

export function suggestCategory(
  merchant: string,
  type: "income" | "expense",
  categories: FinanceCategory[],
  hints?: { service?: string },
): FinanceCategory | undefined {
  const service = hints?.service?.trim();
  const combined = `${merchant} ${service ?? ""}`.trim();

  const fromTransportOrFood = categoryFromService(service, type, categories);
  if (fromTransportOrFood?.name === "Transport") {
    return fromTransportOrFood;
  }

  const fromDrinks = categoryFromMerchantDrinks(merchant, type, categories);
  if (fromDrinks) return fromDrinks;

  if (fromTransportOrFood?.name === "Food") {
    return fromTransportOrFood;
  }

  const fromGaming = categoryFromGaming(combined, type, categories);
  if (fromGaming) return fromGaming;

  const upper = combined.toUpperCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((k) => upper.includes(k))) {
      const match = findCategoryByName(rule.categoryName, type, categories);
      if (match) return match;
    }
  }

  const fallbackName = type === "income" ? "Other Income" : "Other";
  return (
    findCategoryByName(fallbackName, type, categories) ??
    categories.find((c) => c.type === type || c.type === "both")
  );
}
