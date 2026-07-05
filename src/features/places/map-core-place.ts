import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { resolveCategoryType } from "@/features/places/category-type";

export interface CorePlaceMention {
  id: string;
  videoId: string;
  sentiment: string;
  sentimentScore: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  summary: string | null;
  locationText: string | null;
  createdAt: string;
}

export interface CorePlace {
  id: string;
  canonicalName: string;
  category: string | null;
  location: {
    text: string | null;
    lat: number | null;
    lng: number | null;
  };
  trending: {
    mentionCount: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalBookmarks: number;
  };
  mentions: CorePlaceMention[];
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_IMAGES: Record<string, { cover: string; thumbnails: string[] }> = {
  beach: {
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=80&q=60",
    ],
  },
  restaurant: {
    cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60",
    ],
  },
  nightlife: {
    cover: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=80&q=60",
    ],
  },
};

const DEFAULT_IMAGES = {
  cover: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=75",
  thumbnails: [
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=80&q=60",
  ],
};

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

function resolveSentiment(mentions: CorePlaceMention[]): {
  sentiment: PlaceCardData["sentiment"];
  sentimentLabel: string;
} {
  if (mentions.length === 0) {
    return { sentiment: "medium", sentimentLabel: "Neutral Vibe" };
  }

  const average =
    mentions.reduce((sum, mention) => sum + mention.sentimentScore, 0) /
    mentions.length;

  if (average >= 0.66) return { sentiment: "high", sentimentLabel: "High Vibe" };
  if (average >= 0.4) return { sentiment: "medium", sentimentLabel: "Good Vibes" };
  return { sentiment: "low", sentimentLabel: "Mixed Vibe" };
}

function resolveBadge(trending: CorePlace["trending"]): {
  badge: string;
  badgeColor: PlaceCardData["badgeColor"];
} {
  const total =
    trending.totalLikes +
    trending.totalComments +
    trending.totalShares +
    trending.totalBookmarks;

  if (total >= 50_000 || trending.mentionCount >= 5) {
    return { badge: "Explosive", badgeColor: "red" };
  }
  if (total >= 10_000 || trending.mentionCount >= 3) {
    return { badge: "Trending", badgeColor: "cyan" };
  }
  return { badge: "Rising", badgeColor: "rose" };
}

/** Maps a findy-core `GET /places/:id` payload into explore card data. */
export function mapCorePlaceToCardData(
  place: CorePlace,
  rank = 1,
): PlaceCardData {
  const categoryType = resolveCategoryType(place.category);
  const images =
    CATEGORY_IMAGES[categoryType] ??
    CATEGORY_IMAGES[place.category?.trim().toLowerCase() ?? ""] ??
    DEFAULT_IMAGES;
  const { sentiment, sentimentLabel } = resolveSentiment(place.mentions);
  const { badge, badgeColor } = resolveBadge(place.trending);
  const { trending } = place;
  const views =
    trending.totalLikes +
    trending.totalComments +
    trending.totalShares +
    trending.totalBookmarks;
  const description =
    place.mentions.find((mention) => mention.summary)?.summary ??
    `Trending spot with ${trending.mentionCount} viral clips.`;

  return {
    rank,
    id: place.id,
    name: place.canonicalName,
    location: place.location.text ?? "",
    lat: place.location.lat ?? 0,
    lng: place.location.lng ?? 0,
    categories: place.category ? [place.category] : [],
    categoryType,
    description,
    viralScore: formatCompact(views),
    likes: trending.totalLikes,
    comments: trending.totalComments,
    views,
    sentiment,
    sentimentLabel,
    badge,
    badgeColor,
    coverImage: images.cover,
    thumbnails: images.thumbnails,
  };
}
