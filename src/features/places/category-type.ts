import type { PlaceCardData } from "@/features/places/components/PlaceCard";

const CATEGORY_TYPE_MAP: Record<string, PlaceCardData["categoryType"]> = {
  beach: "beach",
  food: "restaurant",
  restaurant: "restaurant",
  restaurants: "restaurant",
  seafood: "restaurant",
  dining: "restaurant",
  cafe: "restaurant",
  "café": "restaurant",
  nightlife: "nightlife",
  bar: "nightlife",
  club: "nightlife",
  shopping: "shopping",
  market: "shopping",
  beauty: "beauty",
  spa: "beauty",
  "beauty & spas": "beauty",
  automotive: "automotive",
  "active life": "active",
  activelife: "active",
  active: "active",
  gym: "active",
  sports: "active",
  "sports & fitness": "active",
  fitness: "active",
  outdoors: "active",
  nature: "active",
  tourism: "active",
  adventure: "active",
  recreation: "active",
  "home services": "home-services",
  "home-services": "home-services",
};

export function resolveCategoryType(
  category: string | null | undefined,
): PlaceCardData["categoryType"] {
  if (!category?.trim()) return "other";
  return CATEGORY_TYPE_MAP[category.trim().toLowerCase()] ?? "other";
}
