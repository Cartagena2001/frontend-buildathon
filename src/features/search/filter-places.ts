import type { PlaceCardData } from "@/features/places/components/PlaceCard";

export type ExploreSentiment = "positive" | "neutral" | "negative";
export type ExploreSort = "viral" | "likes" | "comments" | "views";
export type ExploreCategoryId =
  | "all"
  | "restaurant"
  | "beach"
  | "nightlife"
  | "shopping"
  | "active"
  | "beauty"
  | "automotive"
  | "home-services"
  | "other";

const sentimentMap: Record<ExploreSentiment, PlaceCardData["sentiment"][]> = {
  positive: ["high"],
  neutral: ["medium"],
  negative: ["low"],
};

export interface ExploreFilterState {
  sentiment: ExploreSentiment | null;
  category: ExploreCategoryId;
  sort: ExploreSort;
}

export function filterAndSortPlaces(
  places: PlaceCardData[],
  { sentiment, category, sort }: ExploreFilterState,
): PlaceCardData[] {
  let result = [...places];

  if (sentiment) {
    const levels = sentimentMap[sentiment];
    result = result.filter((place) => levels.includes(place.sentiment));
  }

  if (category !== "all") {
    result = result.filter((place) => place.categoryType === category);
  }

  if (sort === "likes") {
    result.sort((a, b) => b.likes - a.likes);
  } else if (sort === "comments") {
    result.sort((a, b) => b.comments - a.comments);
  } else if (sort === "views") {
    result.sort((a, b) => b.views - a.views);
  } else {
    result.sort((a, b) => a.rank - b.rank);
  }

  return result;
}
