import type { PlaceCardData } from "@/features/places/components/PlaceCard";

const MENTION_SENTIMENT_KEYS = [
  "happy",
  "excited",
  "relaxing",
  "nostalgic",
  "neutral",
  "disappointed",
  "sad",
  "angry",
] as const;

type MentionSentimentKey = (typeof MENTION_SENTIMENT_KEYS)[number];

function isMentionSentimentKey(value: string): value is MentionSentimentKey {
  return (MENTION_SENTIMENT_KEYS as readonly string[]).includes(value);
}

/** True when location text adds no info beyond the canonical place name. */
export function isRedundantLocation(location: string, name: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const a = norm(location);
  const b = norm(name);
  return a.length > 0 && (a === b || a.startsWith(b) || b.startsWith(a));
}

export function aggregateSentimentKey(
  sentiment: PlaceCardData["sentiment"],
): "high" | "medium" | "low" {
  return sentiment;
}

export function mentionSentimentKey(sentiment: string): string | null {
  const key = sentiment.trim().toLowerCase();
  return isMentionSentimentKey(key) ? key : null;
}
