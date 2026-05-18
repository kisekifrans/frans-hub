import assert from "node:assert/strict";
import {
  dedupeCategories,
  dedupePaymentMethods,
  findBudgetLimitForCategory,
} from "./dedupe";
import type { FinanceCategory } from "./types";

function cat(
  id: string,
  name: string,
  type: FinanceCategory["type"] = "expense",
): FinanceCategory {
  return { id, name, icon: "x", color: "#000", type, order: 0 };
}

assert.equal(dedupeCategories([cat("1", "Food"), cat("2", "Food")]).length, 1);
assert.equal(
  dedupeCategories([cat("1", "food"), cat("2", "Food")]).length,
  1,
);
assert.equal(
  dedupeCategories([cat("1", "Food", "expense"), cat("2", "Food", "income")])
    .length,
  2,
);

assert.equal(
  dedupePaymentMethods([
    { id: "a", name: "BCA", icon: "🏦", order: 0 },
    { id: "b", name: "bca", icon: "🏦", order: 1 },
  ]).length,
  1,
);

const found = findBudgetLimitForCategory(
  [
    { id: "lim-1", periodId: "p1", categoryId: "c1" },
    { id: "lim-2", periodId: "p1", categoryId: "c2" },
  ],
  "p1",
  "c1",
);
assert.equal(found?.id, "lim-1");

console.log("finance dedupe tests passed");
