"use client";

import { useTransition } from "react";
import Image from "next/image";
import { unsavePlace } from "@/lib/saved/actions";
import type { SavedPlace } from "@/lib/db/schema";

interface Props {
  place:        SavedPlace;
  removeLabel:  string;
  savedLabel:   string;
}

export default function SavedPlaceCard({ place, removeLabel, savedLabel }: Props) {
  const [pending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      await unsavePlace(place.placeId);
    });
  };

  const savedDate = new Date(place.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col group">
      {/* Cover image */}
      <div className="relative h-40 bg-fp-dim overflow-hidden">
        {place.placeImage ? (
          <Image
            src={place.placeImage}
            alt={place.placeName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-fp-border">
            <PlaceholderIcon />
          </div>
        )}
        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={pending}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-fp-red hover:bg-fp-red hover:text-white transition-colors disabled:opacity-40"
          aria-label={removeLabel}
        >
          <BookmarkFilledIcon />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {place.placeCategories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[0.65rem] font-semibold uppercase tracking-widest text-fp-cyan border border-fp-cyan/30 rounded-full px-2 py-0.5">
              {cat}
            </span>
          ))}
        </div>

        <h3 className="text-fp-cream font-display text-lg leading-tight">{place.placeName}</h3>
        <p className="text-fp-muted text-xs">{place.placeLocation}</p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-fp-muted text-xs">{savedLabel} {savedDate}</span>
          <a
            href={`/explore?place=${place.placeId}`}
            className="text-fp-cyan text-xs font-semibold hover:underline"
          >
            Ver →
          </a>
        </div>
      </div>
    </div>
  );
}

function BookmarkFilledIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function PlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
