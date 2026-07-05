export type GooglePriceLevel =
  | "PRICE_LEVEL_FREE"
  | "PRICE_LEVEL_INEXPENSIVE"
  | "PRICE_LEVEL_MODERATE"
  | "PRICE_LEVEL_EXPENSIVE"
  | "PRICE_LEVEL_VERY_EXPENSIVE";

export interface GooglePlaceLookupInput {
  name: string;
  location?: string;
  locale?: string;
}

export interface GooglePlaceDetails {
  photos: string[];
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  phone?: string;
  website?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: GooglePriceLevel;
  openNow?: boolean;
  weekdayDescriptions?: string[];
  editorialSummary?: string;
}
