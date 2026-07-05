import type { SearchResultItem } from "./types";

/** High-confidence hits from Upstash land in best matches. */
export const BEST_MATCH_SCORE_THRESHOLD = 0.88;

/** Below this, reranking has compressed scores — fall back to name matching. */
const SCORE_SCALE_THRESHOLD = 0.5;

const STOP_WORDS = new Set([
  "a",
  "al",
  "de",
  "del",
  "el",
  "en",
  "la",
  "las",
  "los",
  "un",
  "una",
  "y",
  "the",
  "in",
  "at",
  "for",
  "to",
  "and",
]);

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function significantQueryTokens(query: string): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function placeSearchText(item: SearchResultItem): string {
  const { name, locationText } = item.content;
  return normalizeText(`${name} ${locationText}`);
}

function normalizeScore(score: unknown): number {
  if (typeof score === "number") return score;
  if (typeof score === "string") return Number.parseFloat(score) || 0;
  return 0;
}

/** True when the place name/location literally overlaps with the query tokens. */
export function isExactNameMatch(
  item: SearchResultItem,
  query: string,
): boolean {
  const tokens = significantQueryTokens(query);
  if (tokens.length === 0) return false;

  const haystack = placeSearchText(item);
  return tokens.some((token) => haystack.includes(token));
}

function engagementLikes(item: SearchResultItem): number {
  const likes = item.metadata?.engagement?.likes;
  if (typeof likes === "string") return Number.parseInt(likes, 10) || 0;
  if (typeof likes === "number") return likes;
  return 0;
}

/** Orders search hits by total likes before splitting or mapping. */
export function sortSearchResultsByLikes(
  results: SearchResultItem[],
): SearchResultItem[] {
  return [...results].sort(
    (a, b) => engagementLikes(b) - engagementLikes(a),
  );
}

function isBestMatchByScore(
  item: SearchResultItem,
  query: string,
  maxScore: number,
): boolean {
  const score = normalizeScore(item.score);

  if (score >= BEST_MATCH_SCORE_THRESHOLD) return true;

  // Engagement boost can land a clear name match just under 0.88 (e.g. 0.872).
  if (
    isExactNameMatch(item, query) &&
    score >= 0.85 &&
    score >= maxScore * 0.95
  ) {
    return true;
  }

  return false;
}

function isBestMatchByName(
  item: SearchResultItem,
  query: string,
  maxScore: number,
): boolean {
  const score = normalizeScore(item.score);
  return (
    isExactNameMatch(item, query) &&
    score >= maxScore * 0.9
  );
}

/** Splits strong matches (score ≥ 0.88) from weaker semantic suggestions. */
export function splitSearchResults(
  results: SearchResultItem[],
  query: string,
): {
  exact: SearchResultItem[];
  related: SearchResultItem[];
} {
  if (results.length === 0) {
    return { exact: [], related: [] };
  }

  const maxScore = Math.max(
    ...results.map((item) => normalizeScore(item.score)),
    0,
  );
  const useScoreThreshold = maxScore >= SCORE_SCALE_THRESHOLD;
  const exact: SearchResultItem[] = [];
  const related: SearchResultItem[] = [];

  for (const item of results) {
    const isBest = useScoreThreshold
      ? isBestMatchByScore(item, query, maxScore)
      : isBestMatchByName(item, query, maxScore);

    if (isBest) {
      exact.push(item);
    } else {
      related.push(item);
    }
  }

  return { exact, related };
}
