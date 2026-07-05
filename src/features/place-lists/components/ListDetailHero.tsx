import PlaceListHeroCollage from "@/features/place-lists/components/PlaceListHeroCollage";
import type { PlaceListPlace } from "@/features/place-lists/types";

interface Props {
  name: string;
  description: string | null;
  placeCount: number;
  places: PlaceListPlace[];
  placeCountLabel: string;
}

export default function ListDetailHero({
  name,
  description,
  placeCount,
  places,
  placeCountLabel,
}: Props) {
  return (
    <header className="relative rounded-2xl overflow-hidden border border-fp-border bg-fp-dim mb-8 fade-up">
      <div className="relative h-44 sm:h-52 lg:h-56">
        <PlaceListHeroCollage places={places} />
        <div className="absolute inset-0 bg-gradient-to-t from-fp-dim via-fp-dim/70 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fp-coral text-white text-[0.65rem] font-bold uppercase tracking-wider mb-3">
            <BookmarkIcon />
            {placeCountLabel}
          </span>
          <h1 className="font-display text-fp-cream text-3xl sm:text-4xl lg:text-5xl leading-tight mb-2 text-balance">
            {name}
          </h1>
          {description && (
            <p className="text-fp-muted text-sm sm:text-base max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
          {!description && placeCount > 0 && (
            <p className="text-fp-muted text-sm">{placeCountLabel}</p>
          )}
        </div>
      </div>
    </header>
  );
}

function BookmarkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
