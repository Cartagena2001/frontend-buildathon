import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { EnrichedPlaceListPlace } from "@/features/place-lists/enrich-place-images";

interface Props {
  place: EnrichedPlaceListPlace;
  viewPlaceLabel: string;
  index?: number;
}

export default function SharedPlaceCard({ place, viewPlaceLabel, index = 0 }: Props) {
  const cover = place.coverImage;

  return (
    <Link
      href={`/explore/${place.id}`}
      className="group block bg-fp-dim border border-fp-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-fp-coral/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={cover}
          alt={place.canonicalName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {place.category && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider bg-fp-badge-bg/95 text-fp-teal border border-fp-border backdrop-blur-sm">
            {place.category}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h2 className="font-display text-fp-cream text-base sm:text-lg leading-snug group-hover:text-fp-coral transition-colors line-clamp-2">
          {place.canonicalName}
        </h2>
        {place.location.text && (
          <p className="text-fp-muted text-xs line-clamp-1 flex items-center gap-1">
            <PinIcon />
            {place.location.text}
          </p>
        )}

        <div className="flex items-center justify-end pt-3 mt-auto border-t border-fp-border/60">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-fp-coral text-white text-[0.65rem] font-bold tracking-wide group-hover:bg-fp-coral/90 transition-colors">
            {viewPlaceLabel}
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-fp-teal">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
