"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
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
  relatedPlaces?: PlaceCardData[];
  mapReady?: boolean;
  savedPlaceIds?: string[];
  sentiment: ExploreSentiment | null;
  sort: ExploreSort;
  category: ExploreCategoryId;
  excludeSuspicious: boolean;
  onSentiment: (value: ExploreSentiment | null) => void;
  onSort: (value: ExploreSort) => void;
  onExcludeSuspicious: (value: boolean) => void;
}

export default function ExploreLayout({
  places,
  relatedPlaces = [],
  mapReady = true,
  savedPlaceIds = [],
  sentiment,
  sort,
  category,
  excludeSuspicious,
  onSentiment,
  onSort,
  onExcludeSuspicious,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("explore");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    places[0]?.id ?? relatedPlaces[0]?.id ?? null,
  );

  const filterState = { sentiment, category, sort, excludeSuspicious };

  const filtered = useMemo(
    () => filterAndSortPlaces(places, filterState),
    [places, sentiment, category, sort, excludeSuspicious],
  );

  const filteredRelated = useMemo(
    () => filterAndSortPlaces(relatedPlaces, filterState),
    [relatedPlaces, sentiment, category, sort, excludeSuspicious],
  );

  const mapPlaces = useMemo(
    () => [...filtered, ...filteredRelated],
    [filtered, filteredRelated],
  );

  const resolvedSelectedId =
    mapPlaces.length === 0
      ? null
      : mapPlaces.some((place) => place.id === selectedId)
        ? selectedId
        : mapPlaces[0].id;

  const activeFilterCount = [
    sentiment,
    sort !== "likes" ? sort : null,
    category !== "all" ? category : null,
    !excludeSuspicious ? "showSuspicious" : null,
  ].filter(Boolean).length;

  const filterPanel = (
    <ExploreFilters
      sentiment={sentiment}
      sort={sort}
      excludeSuspicious={excludeSuspicious}
      onSentiment={onSentiment}
      onSort={onSort}
      onExcludeSuspicious={onExcludeSuspicious}
    />
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">

      {/* ── Mobile filter button ── */}
      <div className="lg:hidden shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-fp-border bg-fp-dark w-full absolute top-0 left-0 right-0 z-20">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-fp-border bg-fp-surface px-3.5 py-1.5 text-xs font-medium text-fp-cream transition-colors hover:border-fp-coral/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fp-coral/40"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fp-muted">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          {t("filters.title")}
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-fp-coral px-1 text-[0.6rem] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:w-[232px] xl:w-[248px] shrink-0 flex-col overflow-y-auto border-r border-fp-border bg-fp-surface/60">
        {filterPanel}
      </aside>

      {/* ── Mobile filter drawer ── */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setFiltersOpen(false)} />
          <div className="relative z-10 h-full w-72 overflow-y-auto border-r border-fp-border bg-fp-dark">
            <ExploreFilters
              sentiment={sentiment}
              sort={sort}
              excludeSuspicious={excludeSuspicious}
              onSentiment={onSentiment}
              onSort={onSort}
              onExcludeSuspicious={onExcludeSuspicious}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Results grid ── */}
      <main className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-12">
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          {mapPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-fp-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p className="text-sm">No places match your filters</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.length > 0 ? (
                <ResultsSection
                  title={t("exactResults")}
                  count={filtered.length}
                  places={filtered}
                  savedPlaceIds={savedPlaceIds}
                  selectedId={resolvedSelectedId}
                  onSelect={setSelectedId}
                />
              ) : null}

              {filteredRelated.length > 0 ? (
                <ResultsSection
                  title={t("relatedResults")}
                  subtitle={t("relatedResultsHint")}
                  count={filteredRelated.length}
                  places={filteredRelated}
                  savedPlaceIds={savedPlaceIds}
                  selectedId={resolvedSelectedId}
                  onSelect={setSelectedId}
                />
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* ── Map (desktop only) ── */}
      <aside className="hidden lg:block relative h-full min-h-0 w-[42%] xl:w-[45%] 2xl:w-[48%] shrink-0 border-l border-fp-border">
        {mapReady ? (
          <MapView
            places={mapPlaces}
            selectedId={resolvedSelectedId}
            locale={locale}
            onSelectPlace={(id) => {
              setSelectedId(id);
              const el = document.getElementById(`place-${id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--map-bg)]" aria-hidden />
        )}
      </aside>
    </div>
  );
}

function ResultsSection({
  title,
  subtitle,
  count,
  places,
  savedPlaceIds,
  selectedId,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  count: number;
  places: PlaceCardData[];
  savedPlaceIds: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section>
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-fp-cream text-base sm:text-lg leading-tight">
            {title}
          </h2>
          <span className="text-fp-muted text-[0.68rem]">
            <span className="text-fp-cream font-semibold">{count}</span> places
          </span>
        </div>
        {subtitle ? (
          <p className="text-fp-muted text-[0.68rem] mt-1">{subtitle}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {places.map((place, index) => (
          <PlaceGridCard
            key={place.id}
            place={place}
            selected={selectedId === place.id}
            isSaved={savedPlaceIds.includes(place.id)}
            priority={index < 2}
            onSelect={(id) => {
              onSelect(id);
              const el = document.getElementById(`place-${id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
          />
        ))}
      </div>
    </section>
  );
}
