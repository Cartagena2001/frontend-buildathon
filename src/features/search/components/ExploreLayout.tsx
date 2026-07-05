"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import ExploreFilters from "./ExploreFilters";
import PlaceGridCard from "@/features/places/components/PlaceGridCard";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";
import {
  filterAndSortPlaces,
  type ExploreCategoryId,
  type ExploreSentiment,
  type ExploreSort,
} from "@/features/search/filter-places";

const MapView = dynamic(() => import("@/features/map/components/MapView"), { ssr: false });

interface Props {
  places: PlaceCardData[];
  savedPlaceIds?: string[];
  sentiment: ExploreSentiment | null;
  sort: ExploreSort;
  category: ExploreCategoryId;
  onSentiment: (value: ExploreSentiment | null) => void;
  onSort: (value: ExploreSort) => void;
}

export default function ExploreLayout({
  places,
  savedPlaceIds = [],
  sentiment,
  sort,
  category,
  onSentiment,
  onSort,
}: Props) {
  const locale = useLocale();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(places[0]?.id ?? null);

  const filtered = useMemo(
    () => filterAndSortPlaces(places, { sentiment, category, sort }),
    [places, sentiment, category, sort],
  );

  const resolvedSelectedId =
    filtered.length === 0
      ? null
      : filtered.some((place) => place.id === selectedId)
        ? selectedId
        : filtered[0].id;

  const activeFilterCount = [
    sentiment,
    sort !== "viral" ? sort : null,
    category !== "all" ? category : null,
  ].filter(Boolean).length;

  const filterPanel = (
    <ExploreFilters
      sentiment={sentiment}
      sort={sort}
      onSentiment={onSentiment}
      onSort={onSort}
    />
  );

  return (
    <div className="flex flex-1 overflow-hidden relative">

      {/* ── Mobile filter button ── */}
      <div className="lg:hidden shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-fp-border bg-fp-dark w-full absolute top-0 left-0 right-0 z-20">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fp-border text-fp-muted text-xs hover:text-fp-coral hover:border-fp-coral/50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-fp-coral text-white text-[0.55rem] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:w-[210px] xl:w-[230px] shrink-0 border-r border-fp-border overflow-y-auto flex-col">
        {filterPanel}
      </aside>

      {/* ── Mobile filter drawer ── */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFiltersOpen(false)} />
          <div className="relative w-72 bg-fp-dark border-r border-fp-border h-full overflow-y-auto z-10">
            <button
              onClick={() => setFiltersOpen(false)}
              className="absolute top-4 right-4 text-fp-muted hover:text-fp-cream"
            >
              ✕
            </button>
            {filterPanel}
          </div>
        </div>
      )}

      {/* ── Results grid ── */}
      <main className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-12">
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-fp-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p className="text-sm">No places match your filters</p>
            </div>
          ) : (
            <>
              <p className="text-fp-muted text-[0.68rem] mb-3">
                <span className="text-fp-cream font-semibold">{filtered.length}</span> places
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {filtered.map((place, index) => (
                  <PlaceGridCard
                    key={place.id}
                    place={place}
                    selected={resolvedSelectedId === place.id}
                    isSaved={savedPlaceIds.includes(place.id)}
                    priority={index < 2}
                    onSelect={(id) => {
                      setSelectedId(id);
                      const el = document.getElementById(`place-${id}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Map (desktop only) ── */}
      <aside className="hidden lg:block relative w-[42%] xl:w-[45%] 2xl:w-[48%] shrink-0 border-l border-fp-border">
        <MapView
          places={filtered}
          selectedId={resolvedSelectedId}
          locale={locale}
          onSelectPlace={(id) => {
            setSelectedId(id);
            const el = document.getElementById(`place-${id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }}
        />
      </aside>
    </div>
  );
}
