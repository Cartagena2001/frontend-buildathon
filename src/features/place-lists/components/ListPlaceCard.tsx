"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { removePlaceFromList } from "@/features/place-lists/actions";
import type { EnrichedPlaceListPlace } from "@/features/place-lists/enrich-place-images";
import { formatAppDate } from "@/lib/format-date";

interface Props {
  listId: string;
  place: EnrichedPlaceListPlace;
  index?: number;
}

export default function ListPlaceCard({ listId, place, index = 0 }: Props) {
  const t = useTranslations("lists");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      await removePlaceFromList(listId, place.id);
    });
  };

  const addedDate = formatAppDate(place.addedAt, locale);

  const cover = place.coverImage;

  return (
    <article
      className="group bg-fp-dim border border-fp-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-fp-coral/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}
    >
      {/* Image */}
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

        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="absolute top-3 right-3 w-8 h-8 rounded-full fp-badge-overlay flex items-center justify-center text-fp-coral hover:bg-fp-coral/15 hover:border-fp-coral/40 transition-colors disabled:opacity-40"
          aria-label={t("removePlace")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-display text-fp-cream text-base sm:text-lg leading-snug group-hover:text-fp-coral transition-colors line-clamp-2">
          {place.canonicalName}
        </h3>
        {place.location.text && (
          <p className="text-fp-muted text-xs line-clamp-1 flex items-center gap-1">
            <PinIcon />
            {place.location.text}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-fp-border/60">
          <span className="text-fp-muted text-[0.65rem] font-medium">
            {t("addedOn", { date: addedDate })}
          </span>
          <Link
            href={`/explore/${place.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-fp-coral text-white text-[0.65rem] font-bold tracking-wide hover:bg-fp-coral/90 transition-colors"
          >
            {t("viewPlace")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
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
