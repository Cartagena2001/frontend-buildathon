import type { ExploreCategoryId } from "./filter-places";

export interface ExploreCategoryOption {
  id: Exclude<ExploreCategoryId, "all">;
  icon: string;
}

export const EXPLORE_CATEGORIES: ExploreCategoryOption[] = [
  { id: "restaurant", icon: "🍽️" },
  { id: "shopping", icon: "🛍️" },
  { id: "nightlife", icon: "✦" },
  { id: "active", icon: "🎯" },
  { id: "beauty", icon: "✂️" },
  { id: "automotive", icon: "🚗" },
  { id: "home-services", icon: "🏠" },
  { id: "beach", icon: "🏖️" },
  { id: "other", icon: "···" },
];

const VALID_CATEGORY_IDS = new Set<ExploreCategoryId>([
  "all",
  ...EXPLORE_CATEGORIES.map((category) => category.id),
]);

export function parseExploreCategory(value: string | undefined): ExploreCategoryId {
  if (value && VALID_CATEGORY_IDS.has(value as ExploreCategoryId)) {
    return value as ExploreCategoryId;
  }
  return "all";
}
