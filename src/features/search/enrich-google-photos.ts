import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { getGooglePlacePhotos } from "@/lib/google-places/place-photo";

/**
 * Overrides each place's imagery with Google Places photos when available.
 * Places without a Google match keep their content-based fallback images.
 */
export async function enrichPlacesWithGooglePhotos(
  places: PlaceCardData[],
): Promise<PlaceCardData[]> {
  return Promise.all(
    places.map(async (place) => {
      const photos = await getGooglePlacePhotos({
        name: place.name,
        location: place.location,
        lat: place.lat,
        lng: place.lng,
      });

      if (photos.length === 0) return place;

      return {
        ...place,
        coverImage: photos[0],
        thumbnails: photos.length > 1 ? photos : place.thumbnails,
      };
    }),
  );
}
