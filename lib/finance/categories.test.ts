import assert from "node:assert/strict";
import {
  normalizeCategoryEmoji,
  sortCategoriesForPicker,
  computeCategoryUsageCounts,
} from "./categories";
import type { FinanceCategory } from "./types";

assert.equal(normalizeCategoryEmoji("  🥊  "), "🥊");
assert.equal(normalizeCategoryEmoji(""), "📦");

const cats: FinanceCategory[] = [
  {
    id: "a",
    name: "Food",
    icon: "🍔",
    color: "#f00",
    type: "expense",
    order: 2,
  },
  {
    id: "b",
    name: "Gaming",
    icon: "🎮",
    color: "#00f",
    type: "expense",
    order: 0,
  },
];

const usage = computeCategoryUsageCounts([
  {
    id: "t1",
    type: "expense",
    title: "x",
    description: "",
    amount: 1,
    currency: "IDR",
    categoryId: "b",
    transactionDate: "2026-05-01",
    recurring: false,
    tags: [],
    createdAt: "",
  },
  {
    id: "t2",
    type: "expense",
    title: "y",
    description: "",
    amount: 1,
    currency: "IDR",
    categoryId: "b",
    transactionDate: "2026-05-02",
    recurring: false,
    tags: [],
    createdAt: "",
  },
]);

const sorted = sortCategoriesForPicker(cats, "expense", usage);
assert.equal(sorted[0]?.id, "b");

console.log("categories tests passed");
