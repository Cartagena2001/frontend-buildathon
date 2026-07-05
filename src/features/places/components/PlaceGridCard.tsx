"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { PlaceCardData } from "./PlaceCard";
import { badgeOnImageClasses } from "./place-badge-styles";
import SaveButton from "./SaveButton";
import SharePlaceModal from "@/features/place-lists/components/SharePlaceModal";

const sentimentDot: Record<string, string> = {
  high:   "bg-fp-teal",
  medium: "bg-fp-coral",
  low:    "bg-fp-orange",
};

interface Props {
  place:     PlaceCardData;
  selected?: boolean;
  isSaved?:  boolean;
  priority?: boolean;
  onSelect?: (id: string) => void;
}

export default function PlaceGridCard({
  place,
  selected = false,
  isSaved  = false,
  priority = false,
  onSelect,
}: Props) {
  const router = useRouter();
  const t = useTranslations("lists");
  const [shareOpen, setShareOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-save-button], [data-share-button]")) return;
    onSelect?.(place.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(place.id);
    }
  };

  return (
    <div
      id={`place-${place.id}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative block rounded-2xl overflow-hidden bg-fp-dim transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-fp-coral ${
        selected
          ? "ring-2 ring-fp-coral shadow-lg shadow-fp-coral/10"
          : "hover:shadow-xl hover:shadow-fp-ink/10"
      }`}
    >
      {/* Image */}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <Image
          src={place.coverImage}
          alt={place.name}
          fill
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 280px, 50vw"
        />

        {/* Badge */}
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${badgeOnImageClasses[place.badgeColor]}`}>
          {place.badge}
        </span>

        {/* Save button — stop propagation so it doesn't trigger onSelect */}
        <span data-save-button onClick={(e) => e.stopPropagation()}>
          <SaveButton
            isSaved={isSaved}
            className="absolute top-3 right-3"
            placeId={place.id}
            placeName={place.name}
          />
        </span>

        {/* Rank */}
        <span className="absolute bottom-3 left-3 w-6 h-6 rounded-full fp-badge-overlay flex items-center justify-center text-[0.6rem] font-bold">
          {String(place.rank).padStart(2, "0")}
        </span>

        <span data-share-button onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="absolute bottom-3 right-3 w-7 h-7 rounded-full fp-badge-overlay flex items-center justify-center text-fp-cream hover:text-fp-coral hover:border-fp-coral/40 transition-colors"
            aria-label={t("sharePlaceAction")}
          >
            <ShareIcon />
          </button>
        </span>

        {/* "Ver más" on hover — shortcut to detail */}
        {selected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/explore/${place.id}`);
            }}
            className="absolute bottom-3 right-12 px-2.5 py-1 rounded-full bg-fp-coral text-white text-[0.6rem] font-bold tracking-wide shadow hover:bg-fp-coral/90 transition-colors"
          >
            Ver más
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="font-display text-fp-cream text-sm leading-snug group-hover:text-fp-coral transition-colors line-clamp-1">
            {place.name}
          </h3>
          <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${sentimentDot[place.sentiment]}`} />
        </div>

        <p className="text-fp-muted text-[0.7rem] truncate mb-2">
          {place.location}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-fp-cream text-xs font-semibold">
            {place.viralScore}{" "}
            <span className="text-fp-muted font-normal text-[0.65rem]">viral</span>
          </span>
          <div className="flex items-center gap-2 text-fp-muted text-[0.65rem]">
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {place.likes >= 1000 ? `${(place.likes / 1000).toFixed(0)}K` : place.likes}
            </span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {place.comments >= 1000 ? `${(place.comments / 1000).toFixed(0)}K` : place.comments}
            </span>
          </div>
        </div>
      </div>

      <SharePlaceModal
        placeId={place.id}
        placeName={place.name}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
