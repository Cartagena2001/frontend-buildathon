import type { PlaceCardData } from "@/features/places/components/PlaceCard";

export interface PlaceMentionView {
  id: string;
  videoId: string;
  source: string;
  sourceUrl: string | null;
  sentiment: string;
  sentimentScore: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  summary: string | null;
  evidence: string | null;
  createdAt: string;
}

export interface PlaceDetailData {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  category: string | null;
  categoryType: PlaceCardData["categoryType"];
  coverImage: string;
  badge: string;
  badgeColor: PlaceCardData["badgeColor"];
  mentionCount: number;
  totalLikes: number;
  sentiment: PlaceCardData["sentiment"];
  sentimentLabel: string;
  lastMentionAt: string | null;
  featuredMention: PlaceMentionView | null;
  otherMentions: PlaceMentionView[];
  webMentions: PlaceMentionView[];
}

/** Minimal card shape for MapView on the detail page. */
export function toMapPlace(detail: PlaceDetailData): PlaceCardData {
  return {
    rank: 1,
    id: detail.id,
    name: detail.name,
    location: detail.location,
    lat: detail.lat,
    lng: detail.lng,
    categories: detail.category ? [detail.category] : [],
    categoryType: detail.categoryType,
    description: detail.featuredMention?.summary ?? "",
    viralScore: String(detail.totalLikes),
    likes: detail.totalLikes,
    comments: 0,
    views: detail.totalLikes,
    sentiment: detail.sentiment,
    sentimentLabel: detail.sentimentLabel,
    badge: detail.badge,
    badgeColor: detail.badgeColor,
    coverImage: detail.coverImage,
    thumbnails: [],
  };
}
