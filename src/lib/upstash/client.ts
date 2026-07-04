import { Index } from "@upstash/vector";

import type { PlaceVectorMetadata } from "@/features/places/place-vector-metadata";

function getUpstashConfig(): { url: string; token: string } {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Define UPSTASH_VECTOR_REST_URL y UPSTASH_VECTOR_REST_TOKEN en .env",
    );
  }
  return { url, token };
}

let index: Index<PlaceVectorMetadata> | null = null;

export function getPlacesIndex(): Index<PlaceVectorMetadata> {
  if (!index) {
    const { url, token } = getUpstashConfig();
    index = new Index<PlaceVectorMetadata>({ url, token });
  }
  return index;
}
