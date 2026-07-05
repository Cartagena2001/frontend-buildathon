import PlaceCoverCollage from "@/features/place-lists/components/PlaceCoverCollage";
import { resolvePlaceCoverImage } from "@/features/place-lists/enrich-place-images";
import type { PlaceListPlace } from "@/features/place-lists/types";

interface Props {
  places: Array<PlaceListPlace & { coverImage?: string }>;
}

export default function PlaceListHeroCollage({ places }: Props) {
  const covers = places.slice(0, 3).map(resolvePlaceCoverImage);

  if (covers.length === 0) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-fp-coral/25 via-fp-orange/15 to-fp-teal/15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 70%, var(--fp-brand-coral) 0%, transparent 50%), radial-gradient(circle at 70% 30%, var(--fp-brand-teal) 0%, transparent 45%)",
        }}
      />
    );
  }

  return <PlaceCoverCollage covers={covers} priority />;
}
