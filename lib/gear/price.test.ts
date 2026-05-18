import assert from "node:assert/strict";
import { formatGearPrice } from "@/lib/gear/format";
import { groupGearByCategory, featuredGearItems } from "@/lib/gear/group";
import type { GearCategory, GearItem } from "@/lib/gear/types";
import { gearItemFromDb, gearItemToDb } from "@/lib/supabase/gear-mappers";
import type { DbGearItem } from "@/lib/supabase/database.types";
import {
  normalizeGearCurrency,
  normalizeGearPrice,
  parseGearPriceInput,
} from "@/lib/gear/price";

function testNormalizeGearPrice() {
  assert.equal(normalizeGearPrice(null), null);
  assert.equal(normalizeGearPrice(undefined), null);
  assert.equal(normalizeGearPrice(0), null);
  assert.equal(normalizeGearPrice(-1), null);
  assert.equal(normalizeGearPrice(NaN), null);
  assert.equal(normalizeGearPrice("2500000"), 2500000);
  assert.equal(normalizeGearPrice("199.99"), 199.99);
}

function testParseGearPriceInput() {
  assert.equal(parseGearPriceInput(""), null);
  assert.equal(parseGearPriceInput("2000000"), 2000000);
  assert.equal(parseGearPriceInput("2.000.000"), 2000000);
  assert.equal(parseGearPriceInput("2,500,000"), 2500000);
}

function testMapperRoundTrip() {
  const profileId = "00000000-0000-0000-0000-000000000001";
  const categoryId = "00000000-0000-0000-0000-000000000002";
  const item: GearItem = {
    id: "00000000-0000-0000-0000-000000000003",
    categoryId,
    name: "Mouse",
    description: "",
    price: 2_000_000,
    priceCurrency: "IDR",
    featured: true,
    enabled: true,
    order: 0,
    createdAt: new Date().toISOString(),
  };

  const row = gearItemToDb(item, profileId);
  assert.equal(row.price, 2_000_000);
  assert.equal(row.price_currency, "IDR");

  const dbRow = {
    ...row,
    created_at: item.createdAt,
    updated_at: new Date().toISOString(),
  } as DbGearItem;

  const restored = gearItemFromDb(dbRow);
  assert.equal(restored.price, 2_000_000);
  const label = formatGearPrice(restored.price, restored.priceCurrency);
  assert.ok(label?.includes("2.000.000"));
  assert.ok(label?.includes("Rp"));
}

function testCategoryGroupingPreservesPrice() {
  const mouse: GearCategory = {
    id: "cat-mouse",
    slug: "mouse",
    name: "Mouse",
    order: 0,
  };
  const keyboard: GearCategory = {
    id: "cat-keyboard",
    slug: "keyboard",
    name: "Keyboard",
    order: 1,
  };

  const items: GearItem[] = [
    {
      id: "item-mouse",
      categoryId: mouse.id,
      name: "Mouse A",
      description: "",
      price: 500_000,
      priceCurrency: "IDR",
      featured: false,
      enabled: true,
      order: 0,
      createdAt: "",
    },
    {
      id: "item-keyboard",
      categoryId: keyboard.id,
      name: "Keyboard A",
      description: "",
      price: 1_500_000,
      priceCurrency: "IDR",
      featured: false,
      enabled: true,
      order: 0,
      createdAt: "",
    },
    {
      id: "item-pad",
      categoryId: "cat-pad",
      name: "Pad",
      description: "",
      price: 300_000,
      priceCurrency: "IDR",
      featured: true,
      enabled: true,
      order: 0,
      createdAt: "",
    },
  ];

  const featured = featuredGearItems(items);
  assert.equal(featured.length, 1);
  assert.equal(featured[0]?.price, 300_000);

  const groups = groupGearByCategory([mouse, keyboard], items, {
    hideEmpty: true,
  });
  assert.equal(groups.length, 2);
  assert.equal(groups[0]?.items[0]?.price, 500_000);
  assert.equal(groups[1]?.items[0]?.price, 1_500_000);
}

testNormalizeGearPrice();
testParseGearPriceInput();
testMapperRoundTrip();
testCategoryGroupingPreservesPrice();

console.log("gear price tests passed");
