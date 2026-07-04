"use client";

import { useState } from "react";
import ExploreFilters from "./ExploreFilters";
import PlaceListCard from "@/features/places/components/PlaceListCard";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface Props {
  places: PlaceCardData[];
}

export default function ExploreLayout({ places }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    places[0]?.id ?? null,
  );

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* ── Mobile toolbar (< lg): filters only — no map on mobile ── */}
      <div className="lg:hidden shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-fp-border bg-fp-dark w-full absolute top-0 left-0 right-0 z-20">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fp-border text-fp-muted text-xs hover:text-fp-cream hover:border-fp-rose/40 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
          Filters
        </button>
      </div>

      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex lg:w-[210px] xl:w-[230px] shrink-0 border-r border-fp-border overflow-y-auto flex-col">
        <ExploreFilters />
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
            <ExploreFilters />
          </div>
        </div>
      )}

      {/* ── Results list ── */}
      <main className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-12">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {places.map((place) => (
            <PlaceListCard
              key={place.id}
              place={place}
              selected={selectedId === place.id}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
