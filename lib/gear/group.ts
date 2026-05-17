import type { GearCategory, GearCategoryGroup, GearItem } from "./types";

export function sortGearCategories(categories: GearCategory[]): GearCategory[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function sortGearItems(items: GearItem[]): GearItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function groupGearByCategory(
  categories: GearCategory[],
  items: GearItem[],
  options?: { hideEmpty?: boolean },
): GearCategoryGroup[] {
  const sortedCats = sortGearCategories(categories);
  const groups = sortedCats.map((category) => ({
    category,
    items: sortGearItems(items.filter((i) => i.categoryId === category.id)),
  }));
  if (options?.hideEmpty) {
    return groups.filter((g) => g.items.length > 0);
  }
  return groups;
}

export function featuredGearItems(items: GearItem[]): GearItem[] {
  return sortGearItems(items.filter((i) => i.featured && i.enabled));
}
