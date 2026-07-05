import { resolveCategoryType } from "@/features/places/category-type";

const CATEGORY_IMAGES: Record<string, string> = {
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=75",
  restaurant: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=75",
  nightlife: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=75",
  shopping: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=75",
  beauty: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=75",
  active: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=75",
  automotive: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=75",
  "home-services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=75",
  other: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=75",
};

const DEFAULT_COVER = CATEGORY_IMAGES.other;

const LIST_GRADIENTS = [
  "from-fp-coral/30 via-fp-orange/15 to-fp-teal/10",
  "from-fp-teal/25 via-fp-blue/10 to-fp-lavender/15",
  "from-fp-orange/30 via-fp-coral/15 to-fp-yellow/10",
  "from-fp-blue/20 via-fp-teal/20 to-fp-coral/10",
] as const;

export function getPlaceCoverImage(category: string | null | undefined): string {
  const type = resolveCategoryType(category);
  return CATEGORY_IMAGES[type] ?? DEFAULT_COVER;
}

export function getListCardGradient(listId: string): string {
  let hash = 0;
  for (const char of listId) hash = (hash + char.charCodeAt(0)) % LIST_GRADIENTS.length;
  return LIST_GRADIENTS[hash];
}
