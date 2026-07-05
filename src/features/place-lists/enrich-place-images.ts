import { imagesForCategory } from "@/features/search/map-search-result";
import { resolveCategoryType } from "@/features/places/category-type";
import { getGooglePlacePhotos } from "@/lib/google-places/place-photo";
import type { PlaceListPlace } from "./types";

export type EnrichedPlaceListPlace = PlaceListPlace & {
  coverImage: string;
};

/** Category fallback — same source as Explore search cards. */
export function fallbackCoverImage(category: string | null | undefined): string {
  const raw = category?.trim().toLowerCase() ?? "";
  if (raw) return imagesForCategory(raw).cover;
  return imagesForCategory(resolveCategoryType(category)).cover;
}

/** Resolves cover URL from enriched data or category fallback. */
export function resolvePlaceCoverImage(
  place: PlaceListPlace & { coverImage?: string },
): string {
  return place.coverImage ?? fallbackCoverImage(place.category);
}

/**
 * Enriches list places with Google Places photos when available,
 * matching the Explore flow (`enrichPlacesWithGooglePhotos`).
 */
export async function enrichPlaceListPlace(
  place: PlaceListPlace,
): Promise<EnrichedPlaceListPlace> {
  const fallback = fallbackCoverImage(place.category);

  const google = await getGooglePlacePhotos({
    name: place.canonicalName,
    location: place.location.text ?? undefined,
  });

  return {
    ...place,
    coverImage: google.photos[0] ?? fallback,
  };
}

export async function enrichPlaceListPlaces(
  places: PlaceListPlace[],
): Promise<EnrichedPlaceListPlace[]> {
  return Promise.all(places.map(enrichPlaceListPlace));
}
