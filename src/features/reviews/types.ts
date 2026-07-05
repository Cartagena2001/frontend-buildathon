export interface PlaceReview {
  id: string;
  placeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    image: string | null;
  };
}

export interface MyPlaceReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  place: {
    id: string;
    canonicalName: string;
    locationText: string | null;
    category: string | null;
  };
}

export interface PlaceReviewsData {
  reviews: PlaceReview[];
  myReview: PlaceReview | null;
  ratingAvg: number | null;
  ratingCount: number;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isReviewablePlaceId(id: string): boolean {
  return UUID_RE.test(id);
}
