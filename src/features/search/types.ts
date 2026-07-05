export interface SearchEngagement {
  likes: string;
  comments: string;
  shares: string;
  bookmarks: string;
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
  mentionCount?: number;
  engagement?: SearchEngagement;
  sentiments?: SearchSentiment[];
  videoIds?: string[];
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
}
