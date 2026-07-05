export interface SearchEngagement {
  likes: string | number;
  comments: string | number;
  shares: string | number;
  bookmarks: string | number;
}

export interface SearchSentiment {
  videoId: string;
  sentiment: string;
  sentimentScore: number;
}

export interface SearchResultContent {
  name: string;
  locationText: string;
  category: string;
  summaries: string[];
}

export interface SearchResultCoordinates {
  lat: number;
  lng: number;
}

export interface SearchResultMetadata {
  coordinates?: SearchResultCoordinates;
  department?: string;
  municipality?: string;
  category?: string;
  verificationStatus?: string;
  sources?: string[];
  sourceUrls?: string[];
  mentionCount?: number;
  engagement?: SearchEngagement;
  sentiments?: SearchSentiment[];
  videoIds?: string[];
  suspicious?: boolean;
}

/** Single hit returned by `POST search.findy.place/query`. */
export interface SearchResultItem {
  id: string;
  score: number;
  content: SearchResultContent;
  metadata?: SearchResultMetadata;
}

export interface SearchQuery {
  query: string;
  index?: string;
  limit?: number;
  filter?: string;
  /** 0 = keyword-only, 1 = semantic-only. Default 0.5 balances place names and meaning. */
  semanticWeight?: number;
  /** Re-score candidates with Upstash's reranker for better ordering. */
  reranking?: boolean;
}
