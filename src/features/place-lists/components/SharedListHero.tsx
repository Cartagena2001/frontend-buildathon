import PlaceListHeroCollage from "@/features/place-lists/components/PlaceListHeroCollage";
import type { PlaceListPlace } from "@/features/place-lists/types";

interface Props {
  name: string;
  description: string | null;
  ownerName: string;
  places: PlaceListPlace[];
  placeCountLabel: string;
  sharedListLabel: string;
  sharedByLabel: string;
}

export default function SharedListHero({
  name,
  description,
  ownerName,
  places,
  placeCountLabel,
  sharedListLabel,
  sharedByLabel,
}: Props) {
  return (
    <header className="relative rounded-2xl overflow-hidden border border-fp-border bg-fp-dim mb-8 fade-up">
      <div className="relative h-44 sm:h-52 lg:h-56">
        <PlaceListHeroCollage places={places} />
        <div className="absolute inset-0 bg-gradient-to-t from-fp-dim via-fp-dim/70 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fp-teal text-white text-[0.65rem] font-bold uppercase tracking-wider">
              <ShareIcon />
              {sharedListLabel}
            </span>
            {places.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-fp-surface border border-fp-border text-fp-muted text-[0.65rem] font-semibold uppercase tracking-wider">
                {placeCountLabel}
              </span>
            )}
          </div>

          <h1 className="font-display text-fp-cream text-3xl sm:text-4xl lg:text-5xl leading-tight mb-2 text-balance">
            {name}
          </h1>

          {description && (
            <p className="text-fp-muted text-sm sm:text-base max-w-2xl leading-relaxed mb-2">
              {description}
            </p>
          )}

          <p className="text-fp-muted text-sm flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-fp-coral/15 text-fp-coral text-xs font-bold flex items-center justify-center shrink-0">
              {ownerName.charAt(0).toUpperCase()}
            </span>
            {sharedByLabel}
          </p>
        </div>
      </div>
    </header>
  );
}

function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
