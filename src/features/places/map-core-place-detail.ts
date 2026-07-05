import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import { resolveCategoryType } from "@/features/places/category-type";
import type {
  PlaceDetailData,
  PlaceMentionView,
} from "@/features/places/place-detail.types";
import type { CorePlace, CorePlaceMention } from "@/features/places/map-core-place";
import type { SearchResultItem } from "@/features/search/types";
import { imagesForCategory as searchImagesForCategory } from "@/features/search/map-search-result";

const CATEGORY_IMAGES: Record<string, { cover: string }> = {
  beach: {
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
  },
  restaurant: {
    cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75",
  },
  nightlife: {
    cover: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75",
  },
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=75";

function mentionEngagement(mention: CorePlaceMention | PlaceMentionView): number {
  return mention.likes + mention.comments + mention.shares + mention.bookmarks;
}

function toMentionView(mention: CorePlaceMention): PlaceMentionView {
  return {
    id: mention.id,
    videoId: mention.videoId,
    sentiment: mention.sentiment,
    sentimentScore: mention.sentimentScore,
    likes: mention.likes,
    comments: mention.comments,
    shares: mention.shares,
    bookmarks: mention.bookmarks,
    summary: mention.summary,
    createdAt: mention.createdAt,
  };
}

function pickFeaturedMention(
  mentions: CorePlaceMention[],
): CorePlaceMention | null {
  if (mentions.length === 0) return null;

  const withSummary = mentions.filter((m) => m.summary?.trim());
  const pool = withSummary.length > 0 ? withSummary : mentions;

  return pool.reduce((best, mention) =>
    mentionEngagement(mention) > mentionEngagement(best) ? mention : best,
  );
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

function resolveLastMentionAt(mentions: CorePlaceMention[]): string | null {
  if (mentions.length === 0) return null;
  return mentions.reduce(
    (latest, mention) =>
      mention.createdAt > latest ? mention.createdAt : latest,
    mentions[0].createdAt,
  );
}

function coverForCategory(category: string | null, categoryType: PlaceCardData["categoryType"]): string {
  return (
    CATEGORY_IMAGES[categoryType]?.cover ??
    CATEGORY_IMAGES[category?.trim().toLowerCase() ?? ""]?.cover ??
    DEFAULT_COVER
  );
}

/** Maps findy-core `GET /places/:id` into the Place Detail view model. */
export function mapCorePlaceToDetailData(place: CorePlace): PlaceDetailData {
  const categoryType = resolveCategoryType(place.category);
  const { sentiment, sentimentLabel } = resolveSentiment(place.mentions);
  const { badge, badgeColor } = resolveBadge(place.trending);
  const featured = pickFeaturedMention(place.mentions);
  const featuredView = featured ? toMentionView(featured) : null;
  const otherMentions = place.mentions
    .filter((m) => m.id !== featured?.id)
    .map(toMentionView)
    .sort((a, b) => mentionEngagement(b) - mentionEngagement(a));

  return {
    id: place.id,
    name: place.canonicalName,
    location: place.location.text ?? "",
    lat: place.location.lat ?? 0,
    lng: place.location.lng ?? 0,
    category: place.category,
    categoryType,
    coverImage: coverForCategory(place.category, categoryType),
    badge,
    badgeColor,
    mentionCount: place.trending.mentionCount,
    totalLikes: place.trending.totalLikes,
    sentiment,
    sentimentLabel,
    lastMentionAt: resolveLastMentionAt(place.mentions),
    featuredMention: featuredView,
    otherMentions,
  };
}

function toInt(value?: string): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveSearchSentiment(item: SearchResultItem): {
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
  if (average >= 0.4) return { sentiment: "medium", sentimentLabel: "Good Vibes" };
  return { sentiment: "low", sentimentLabel: "Mixed Vibe" };
}

function resolveSearchBadge(score: number): {
  badge: string;
  badgeColor: PlaceCardData["badgeColor"];
} {
  if (score >= 0.8) return { badge: "Explosive", badgeColor: "red" };
  if (score >= 0.7) return { badge: "Trending", badgeColor: "cyan" };
  return { badge: "Rising", badgeColor: "rose" };
}

/** Degraded detail from a search-index hit when core has no Postgres row yet. */
export function mapSearchResultToDetailData(item: SearchResultItem): PlaceDetailData {
  const { content, metadata } = item;
  const category = metadata?.category ?? content.category ?? "";
  const categoryType = resolveCategoryType(category);
  const images = searchImagesForCategory(category);
  const { sentiment, sentimentLabel } = resolveSearchSentiment(item);
  const { badge, badgeColor } = resolveSearchBadge(item.score);
  const engagement = metadata?.engagement;
  const likes = toInt(engagement?.likes);
  const comments = toInt(engagement?.comments);
  const shares = toInt(engagement?.shares);
  const bookmarks = toInt(engagement?.bookmarks);
  const summaries = content.summaries ?? [];
  const sentiments = metadata?.sentiments ?? [];
  const videoIds = metadata?.videoIds ?? [];

  const syntheticMentions: PlaceMentionView[] = summaries.map((summary, index) => {
    const sentimentEntry = sentiments[index];
    const videoId = videoIds[index] ?? `search-${item.id}-${index}`;
    return {
      id: `${item.id}-mention-${index}`,
      videoId,
      sentiment: sentimentEntry?.sentiment ?? "neutral",
      sentimentScore: sentimentEntry?.sentimentScore ?? 0.5,
      likes: index === 0 ? likes : 0,
      comments: index === 0 ? comments : 0,
      shares: index === 0 ? shares : 0,
      bookmarks: index === 0 ? bookmarks : 0,
      summary,
      createdAt: new Date().toISOString(),
    };
  });

  const featured = syntheticMentions.length > 0
    ? syntheticMentions.reduce((best, mention) =>
        mentionEngagement(mention) > mentionEngagement(best) ? mention : best,
      )
    : null;

  const otherMentions = syntheticMentions.filter((m) => m.id !== featured?.id);

  return {
    id: item.id,
    name: content.name,
    location: content.locationText,
    lat: metadata?.coordinates?.lat ?? 0,
    lng: metadata?.coordinates?.lng ?? 0,
    category: category || null,
    categoryType,
    coverImage: images.cover,
    badge,
    badgeColor,
    mentionCount: metadata?.mentionCount ?? syntheticMentions.length,
    totalLikes: likes,
    sentiment,
    sentimentLabel,
    lastMentionAt: featured?.createdAt ?? null,
    featuredMention: featured,
    otherMentions,
  };
}
