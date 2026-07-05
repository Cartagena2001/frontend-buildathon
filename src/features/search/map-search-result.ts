import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { resolveCategoryType } from "@/features/places/category-type";
import type { SearchResultItem } from "./types";

interface CategoryImages {
  cover: string;
  thumbnails: string[];
}

/** Search hits carry no imagery, so we fall back to category-based visuals. */
const CATEGORY_IMAGES: Record<string, CategoryImages> = {
  beach: {
    cover:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=80&q=60",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=80&q=60",
    ],
  },
  food: {
    cover:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&q=60",
    ],
  },
  restaurant: {
    cover:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60",
    ],
  },
  cafe: {
    cover:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=60",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=60",
    ],
  },
  nightlife: {
    cover:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75",
    thumbnails: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=80&q=60",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&q=60",
    ],
  },
};

const DEFAULT_IMAGES: CategoryImages = {
  cover:
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=75",
  thumbnails: [
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=80&q=60",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&q=60",
  ],
};

export function imagesForCategory(category: string): CategoryImages {
  return CATEGORY_IMAGES[category.trim().toLowerCase()] ?? DEFAULT_IMAGES;
}

function toInt(value?: string): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

function resolveViralScore(item: SearchResultItem): string {
  const engagement = item.metadata?.engagement;
  const total = engagement
    ? toInt(engagement.likes) +
      toInt(engagement.comments) +
      toInt(engagement.shares) +
      toInt(engagement.bookmarks)
    : 0;

  if (total > 0) return formatCompact(total);
  return String(item.metadata?.mentionCount ?? 0);
}

function resolveSentiment(item: SearchResultItem): {
  sentiment: PlaceCardData["sentiment"];
  sentimentLabel: string;
} {
  const sentiments = item.metadata?.sentiments ?? [];
  if (sentiments.length === 0) {
    return { sentiment: "medium", sentimentLabel: "Neutral Vibe" };
  }

  const average =
    sentiments.reduce((sum, entry) => sum + (entry.sentimentScore ?? 0), 0) /
    sentiments.length;

  if (average >= 0.66) return { sentiment: "high", sentimentLabel: "High Vibe" };
  if (average >= 0.4)
    return { sentiment: "medium", sentimentLabel: "Good Vibes" };
  return { sentiment: "low", sentimentLabel: "Mixed Vibe" };
}

function resolveBadge(score: number): {
  badge: string;
  badgeColor: PlaceCardData["badgeColor"];
} {
  if (score >= 0.8) return { badge: "Explosive", badgeColor: "red" };
  if (score >= 0.7) return { badge: "Trending", badgeColor: "cyan" };
  return { badge: "Rising", badgeColor: "rose" };
}

function mapSearchResult(
  item: SearchResultItem,
  index: number,
): PlaceCardData {
  const { content, metadata } = item;
  const category = metadata?.category ?? content.category ?? "";
  const images = imagesForCategory(category);
  const { sentiment, sentimentLabel } = resolveSentiment(item);
  const { badge, badgeColor } = resolveBadge(item.score);

  const engagement = metadata?.engagement;
  const likes = toInt(engagement?.likes);
  const comments = toInt(engagement?.comments);
  const views =
    likes + comments + toInt(engagement?.shares) + toInt(engagement?.bookmarks);

  return {
    rank: index + 1,
    id: item.id,
    name: content.name,
    location: content.locationText,
    lat: metadata?.coordinates?.lat ?? 0,
    lng: metadata?.coordinates?.lng ?? 0,
    categories: category ? [category] : [],
    categoryType: resolveCategoryType(category),
    description: content.summaries?.[0] ?? "",
    viralScore: resolveViralScore(item),
    likes,
    comments,
    views,
    sentiment,
    sentimentLabel,
    badge,
    badgeColor,
    coverImage: images.cover,
    thumbnails: images.thumbnails,
  };
}

/** Maps raw search hits into the card shape the explore list renders. */
export function mapSearchResultsToPlaces(
  results: SearchResultItem[],
): PlaceCardData[] {
  return results.map(mapSearchResult);
}
