import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { getGooglePlacePhotos } from "@/lib/google-places/place-photo";

/**
 * Enriches places with Google Places data: accurate coordinates for the map
 * and photos when available. Places without a Google match keep index data.
 */
export async function enrichPlacesWithGooglePhotos(
  places: PlaceCardData[],
): Promise<PlaceCardData[]> {
  return Promise.all(
    places.map(async (place) => {
      const google = await getGooglePlacePhotos({
        name: place.name,
        location: place.location,
      });

      const hasCoords =
        typeof google.lat === "number" && typeof google.lng === "number";
      const hasPhotos = google.photos.length > 0;

      if (!hasCoords && !hasPhotos) return place;

      return {
        ...place,
        ...(hasCoords ? { lat: google.lat, lng: google.lng } : {}),
        ...(hasPhotos
          ? {
              coverImage: google.photos[0],
              thumbnails:
                google.photos.length > 1 ? google.photos : place.thumbnails,
            }
          : {}),
      };
    }),
  );
}
