import { fallbackCoverImage } from "@/features/place-lists/enrich-place-images";

const LIST_GRADIENTS = [
  "from-fp-coral/30 via-fp-orange/15 to-fp-teal/10",
  "from-fp-teal/25 via-fp-blue/10 to-fp-lavender/15",
  "from-fp-orange/30 via-fp-coral/15 to-fp-yellow/10",
  "from-fp-blue/20 via-fp-teal/20 to-fp-coral/10",
] as const;

/** @deprecated Use resolvePlaceCoverImage on enriched places */
export function getPlaceCoverImage(category: string | null | undefined): string {
  return fallbackCoverImage(category);
}

export function getListCardGradient(listId: string): string {
  let hash = 0;
  for (const char of listId) hash = (hash + char.charCodeAt(0)) % LIST_GRADIENTS.length;
  return LIST_GRADIENTS[hash];
}
