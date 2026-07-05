"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ExploreLayout from "./ExploreLayout";
import MascotLoadingOverlay from "@/components/mascot/MascotLoadingOverlay";
import { fetchSearchResults } from "../search-client";
import { getCachedResults, setCachedResults } from "../search-results-cache";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface Props {
  query: string;
  savedPlaceIds: string[];
}

export default function ExploreResults({ query, savedPlaceIds }: Props) {
  const t = useTranslations("explore");
  const cached = query ? getCachedResults(query) : null;
  const [places, setPlaces] = useState<PlaceCardData[]>(cached ?? []);
  const [loading, setLoading] = useState(Boolean(query) && cached === null);

  useEffect(() => {
    if (!query) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    const hit = getCachedResults(query);
    if (hit) {
      setPlaces(hit);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    fetchSearchResults(query)
      .then((results) => {
        if (!active) return;
        setCachedResults(query, results);
        setPlaces(results);
      })
      .catch(() => {
        if (active) setPlaces([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <>
      {loading ? <MascotLoadingOverlay variant="search" /> : null}

      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-fp-border">
        <div>
          <h1 className="font-display text-fp-cream text-xl sm:text-2xl leading-tight">
            {t("title")}
          </h1>
          <p className="text-fp-muted text-xs mt-0.5 hidden sm:block">
            {t("subtitle", { count: String(places.length), clips: "1,420" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-fp-muted text-xs hidden sm:block">
            {t("sortedBy")}
          </span>
          <SortDropdown />
        </div>
      </div>

      <ExploreLayout places={places} savedPlaceIds={savedPlaceIds} />
    </>
  );
}

function SortDropdown() {
  return (
    <div className="flex items-center gap-1.5 border border-fp-border rounded-full px-3 py-1.5 cursor-pointer hover:border-fp-coral/50 transition-colors">
      <span className="font-sans text-fp-cream text-xs font-medium whitespace-nowrap">
        Viral Momentum
      </span>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-fp-muted shrink-0"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
