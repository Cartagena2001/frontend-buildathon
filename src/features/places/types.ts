export type PlaceCategory = "beach" | "restaurant" | "nightlife" | "other";

export interface RawApifyVideo {
  id: string;
  url: string;
  caption?: string;
  likes: number;
  views: number;
  authorHandle?: string;
  postedAt?: string;
}

export interface PlaceComment {
  text: string;
  likes?: number;
  author?: string;
}

export interface Place {
  id_place: string;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  category: PlaceCategory;
  videos: RawApifyVideo[];
  comments?: PlaceComment[];
  trending: {
    likes: number;
    views: number;
    normalized: number;
  };
  sentiment: {
    score: number;
    summary: string;
  };
  description: string;
  embedding_text: string;
  updatedAt: Date;
}
