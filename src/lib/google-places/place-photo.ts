const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
/** Cache Google lookups for a day — place photos rarely change. */
const REVALIDATE_SECONDS = 86_400;

interface PhotoLookup {
  name: string;
  location?: string;
  lat?: number;
  lng?: number;
}

interface GooglePhoto {
  name?: string;
}

interface GooglePlace {
  photos?: GooglePhoto[];
}

interface TextSearchResponse {
  places?: GooglePlace[];
}

interface PhotoMediaResponse {
  photoUri?: string;
}

/**
 * Resolves up to `limit` public photo URLs for a place via Google Places.
 * Returns an empty array when no API key is configured or nothing is found,
 * so callers can fall back to content-based imagery.
 */
export async function getGooglePlacePhotos(
  { name, location, lat, lng }: PhotoLookup,
  limit = 3,
): Promise<string[]> {
  if (!API_KEY || !name.trim()) return [];

  try {
    const hasCoords = typeof lat === "number" && typeof lng === "number";
    const textQuery = location ? `${name}, ${location}` : name;

    const searchRes = await fetch(TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 1,
        ...(hasCoords
          ? {
              locationBias: {
                circle: {
                  center: { latitude: lat, longitude: lng },
                  radius: 5000,
                },
              },
            }
          : {}),
      }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!searchRes.ok) return [];

    const data = (await searchRes.json()) as TextSearchResponse;
    const photoNames = (data.places?.[0]?.photos ?? [])
      .map((photo) => photo.name)
      .filter((photoName): photoName is string => Boolean(photoName))
      .slice(0, limit);

    const uris = await Promise.all(photoNames.map(resolvePhotoUri));
    return uris.filter((uri): uri is string => Boolean(uri));
  } catch {
    return [];
  }
}

/** Resolves a photo resource name to its public googleusercontent URL. */
async function resolvePhotoUri(photoName: string): Promise<string | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true`,
      {
        headers: { "X-Goog-Api-Key": API_KEY },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!res.ok) return null;

    const media = (await res.json()) as PhotoMediaResponse;
    return media.photoUri ?? null;
  } catch {
    return null;
  }
}
