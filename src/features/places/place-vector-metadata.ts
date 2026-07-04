import type { Place, PlaceCategory } from "@/features/places/types";

export interface PlaceVectorMetadata extends Record<string, unknown> {
  id_place: string;
  name: string;
  category: PlaceCategory;
  address: string;
  lat: number;
  lng: number;
  trending_likes: number;
  trending_views: number;
  trending_normalized: number;
  sentiment_score: number;
  sentiment_summary: string;
  description: string;
  embedding_text: string;
  updated_at: string;
  videos_json: string;
  comments_json: string;
}

export function placeToMetadata(place: Place): PlaceVectorMetadata {
  return {
    id_place: place.id_place,
    name: place.name,
    category: place.category,
    address: place.location.address,
    lat: place.location.lat,
    lng: place.location.lng,
    trending_likes: place.trending.likes,
    trending_views: place.trending.views,
    trending_normalized: place.trending.normalized,
    sentiment_score: place.sentiment.score,
    sentiment_summary: place.sentiment.summary,
    description: place.description,
    embedding_text: place.embedding_text,
    updated_at: place.updatedAt.toISOString(),
    videos_json: JSON.stringify(place.videos),
    comments_json: JSON.stringify(place.comments ?? []),
  };
}

export function metadataToPlace(metadata: PlaceVectorMetadata): Place {
  return {
    id_place: metadata.id_place,
    name: metadata.name,
    location: {
      address: metadata.address,
      lat: metadata.lat,
      lng: metadata.lng,
    },
    category: metadata.category,
    videos: JSON.parse(metadata.videos_json) as Place["videos"],
    comments: JSON.parse(metadata.comments_json) as Place["comments"],
    trending: {
      likes: metadata.trending_likes,
      views: metadata.trending_views,
      normalized: metadata.trending_normalized,
    },
    sentiment: {
      score: metadata.sentiment_score,
      summary: metadata.sentiment_summary,
    },
    description: metadata.description,
    embedding_text: metadata.embedding_text,
    updatedAt: new Date(metadata.updated_at),
  };
}
