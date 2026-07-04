import { MOCK_PLACES } from "@/features/places/data/mock-places";
import type { Place } from "@/features/places/types";

const CATEGORY_KEYWORDS: Record<string, Place["category"][]> = {
  surf: ["beach"],
  surfing: ["beach"],
  playa: ["beach"],
  playas: ["beach"],
  beach: ["beach"],
  beaches: ["beach"],
  pupusa: ["restaurant"],
  pupusas: ["restaurant"],
  comida: ["restaurant"],
  food: ["restaurant"],
  restaurant: ["restaurant"],
  restaurante: ["restaurant"],
  nightlife: ["nightlife"],
  noche: ["nightlife"],
  bar: ["nightlife"],
  bares: ["nightlife"],
  escalón: ["nightlife"],
  escalon: ["nightlife"],
  café: ["other"],
  cafe: ["other"],
  coffee: ["other"],
};

function matchesQuery(place: Place, query: string): boolean {
  const haystack = [
    place.name,
    place.location.address,
    place.description,
    place.embedding_text,
    place.category,
    place.sentiment.summary,
  ]
    .join(" ")
    .toLowerCase();

  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.every((token) => {
    if (haystack.includes(token)) return true;
    const categories = CATEGORY_KEYWORDS[token];
    return categories?.includes(place.category) ?? false;
  });
}

export function mockSearchPlaces(query: string): Place[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results = MOCK_PLACES.filter((place) => matchesQuery(place, trimmed));

  return results.sort(
    (a, b) => b.trending.normalized - a.trending.normalized,
  );
}
