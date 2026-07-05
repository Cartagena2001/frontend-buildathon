export interface PlaceListPlace {
  id: string;
  canonicalName: string;
  category: string | null;
  location: {
    text: string | null;
    lat: number | null;
    lng: number | null;
  };
  addedAt: string;
}

export interface PlaceList {
  id: string;
  name: string;
  description: string | null;
  placeCount: number;
  isShared: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceListDetail extends PlaceList {
  places: PlaceListPlace[];
}

export interface SharedPlaceList {
  name: string;
  description: string | null;
  owner: {
    firstName: string;
  };
  places: PlaceListPlace[];
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
