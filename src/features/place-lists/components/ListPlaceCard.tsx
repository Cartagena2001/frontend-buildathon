"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { removePlaceFromList } from "@/features/place-lists/actions";
import type { PlaceListPlace } from "@/features/place-lists/types";

interface Props {
  listId: string;
  place: PlaceListPlace;
}

export default function ListPlaceCard({ listId, place }: Props) {
  const t = useTranslations("lists");
  const [pending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      await removePlaceFromList(listId, place.id);
    });
  };

  const addedDate = new Date(place.addedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {place.category && (
            <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-fp-cyan border border-fp-cyan/30 rounded-full px-2 py-0.5">
              {place.category}
            </span>
          )}
          <h3 className="font-display text-fp-cream text-lg leading-tight mt-2">
            {place.canonicalName}
          </h3>
          {place.location.text && (
            <p className="text-fp-muted text-xs mt-1">{place.location.text}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="w-8 h-8 rounded-full flex items-center justify-center text-fp-red hover:bg-fp-red/10 transition-colors disabled:opacity-40 shrink-0"
          aria-label={t("removePlace")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 mt-auto">
        <span className="text-fp-muted text-xs">{t("addedOn", { date: addedDate })}</span>
        <Link
          href={`/explore/${place.id}`}
          className="text-fp-cyan text-xs font-semibold hover:underline"
        >
          {t("viewPlace")} →
        </Link>
      </div>
    </div>
  );
}
