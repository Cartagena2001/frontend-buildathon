import Image from "next/image";
import { getPlaceCoverImage } from "@/features/place-lists/place-cover";
import type { PlaceListPlace } from "@/features/place-lists/types";

interface Props {
  places: PlaceListPlace[];
}

export default function PlaceListHeroCollage({ places }: Props) {
  const previews = places.slice(0, 3);

  if (previews.length === 1) {
    return (
      <div className="absolute inset-0">
        <Image
          src={getPlaceCoverImage(previews[0].category)}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
    );
  }

  if (previews.length === 2) {
    return (
      <div className="absolute inset-0 grid grid-cols-2">
        {previews.map((place) => (
          <div key={place.id} className="relative overflow-hidden">
            <Image
              src={getPlaceCoverImage(place.category)}
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        ))}
      </div>
    );
  }

  if (previews.length >= 3) {
    return (
      <div className="absolute inset-0 grid grid-cols-3">
        {previews.map((place, i) => (
          <div
            key={place.id}
            className={`relative overflow-hidden ${i === 0 ? "col-span-2" : ""}`}
          >
            <Image
              src={getPlaceCoverImage(place.category)}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    );
  }

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
