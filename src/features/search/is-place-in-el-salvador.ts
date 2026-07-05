import type { PlaceCardData } from "@/features/places/components/PlaceCard";

const EL_SALVADOR_BOUNDS = {
  minLat: 12.9,
  maxLat: 14.5,
  minLng: -90.2,
  maxLng: -87.6,
};

const EL_SALVADOR_DEPARTMENTS = [
  "Ahuachapán",
  "Santa Ana",
  "Sonsonate",
  "Chalatenango",
  "La Libertad",
  "San Salvador",
  "Cuscatlán",
  "La Paz",
  "Cabañas",
  "San Vicente",
  "Usulután",
  "San Miguel",
  "Morazán",
  "La Unión",
] as const;

const FOREIGN_LOCATION_MARKERS = [
  "guatemala",
  "honduras",
  "nicaragua",
  "costa rica",
  "panama",
  "mexico",
  "méxico",
  "united states",
  "usa",
  "u.s.a",
  "canada",
  "colombia",
  "peru",
  "perú",
  "chile",
  "argentina",
  "ecuador",
  "venezuela",
  "brazil",
  "brasil",
  "spain",
  "españa",
  "california",
  "texas",
  "florida",
  "new york",
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function hasValidCoordinates(place: PlaceCardData): boolean {
  return place.lat !== 0 || place.lng !== 0;
}

function isWithinElSalvadorBounds(lat: number, lng: number): boolean {
  return (
    lat >= EL_SALVADOR_BOUNDS.minLat &&
    lat <= EL_SALVADOR_BOUNDS.maxLat &&
    lng >= EL_SALVADOR_BOUNDS.minLng &&
    lng <= EL_SALVADOR_BOUNDS.maxLng
  );
}

function mentionsElSalvador(location: string): boolean {
  return normalize(location).includes("el salvador");
}

function mentionsSalvadoranDepartment(location: string): boolean {
  const normalized = normalize(location);
  return EL_SALVADOR_DEPARTMENTS.some((department) =>
    normalized.includes(normalize(department)),
  );
}

function mentionsForeignLocation(location: string): boolean {
  const normalized = normalize(location);
  return FOREIGN_LOCATION_MARKERS.some((marker) => normalized.includes(marker));
}

/** Keeps only places that appear to be located in El Salvador. */
export function isPlaceInElSalvador(place: PlaceCardData): boolean {
  const location = place.location ?? "";

  if (mentionsForeignLocation(location)) {
    return false;
  }

  if (hasValidCoordinates(place)) {
    return isWithinElSalvadorBounds(place.lat, place.lng);
  }

  return mentionsElSalvador(location) || mentionsSalvadoranDepartment(location);
}

export function filterPlacesInElSalvador(places: PlaceCardData[]): PlaceCardData[] {
  return places.filter(isPlaceInElSalvador);
}
