"use client";

import { useTranslations } from "next-intl";
import type { Place, PlaceCategory } from "@/features/places/types";

const CATEGORY_KEYS: Record<PlaceCategory, string> = {
  beach: "beach",
  restaurant: "restaurant",
  nightlife: "nightlife",
  other: "other",
};

interface PlaceCardProps {
  place: Place;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export default function PlaceCard({
  place,
  selected = false,
  onSelect,
}: PlaceCardProps) {
  const t = useTranslations("explore");
  const categoryKey = CATEGORY_KEYS[place.category];

  return (
    <article
      id={`place-${place.id_place}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(place.id_place)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(place.id_place);
        }
      }}
      className={`rounded-2xl border p-4 transition-colors cursor-pointer ${
        selected
          ? "border-fp-cyan bg-fp-cyan-dim"
          : "border-fp-border bg-fp-surface hover:border-fp-rose/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display text-xl text-fp-cream leading-tight">
          {place.name}
        </h3>
        <span className="shrink-0 rounded-full border border-fp-border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-fp-muted">
          {t(`categories.${categoryKey}`)}
        </span>
      </div>

      <p className="text-sm text-fp-muted mb-3">{place.location.address}</p>
      <p className="text-sm text-fp-cream/90 leading-relaxed mb-4">
        {place.description}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-fp-muted">
        <span>
          {t("stats.views", {
            count: Math.round(place.trending.views / 1000),
          })}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {t("stats.sentiment", {
            score: Math.round(place.sentiment.score * 100),
          })}
        </span>
      </div>
    </article>
  );
}
