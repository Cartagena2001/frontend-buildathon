"use client";

import { useState } from "react";
import ExploreFilters from "./ExploreFilters";
import MapPanel from "@/features/map/components/MapPanel";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface Props {
  places: PlaceCardData[];
  children: React.ReactNode;
}

export default function ExploreLayout({ places, children }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* ── Mobile toolbar (< lg) ── */}
      <div className="lg:hidden shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-fp-border bg-fp-dark w-full absolute top-0 left-0 right-0 z-20">
        <button
          onClick={() => { setFiltersOpen(true); setMapOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fp-border text-fp-muted text-xs hover:text-fp-cream hover:border-fp-rose/40 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
          Filters
        </button>
        <button
          onClick={() => { setMapOpen(true); setFiltersOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fp-border text-fp-muted text-xs hover:text-fp-cream hover:border-fp-rose/40 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
          Map
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
        {children}
      </main>

      {/* ── Desktop map panel (lg+) ── */}
      <aside className="hidden lg:block lg:w-[380px] xl:w-[480px] 2xl:w-[560px] shrink-0 border-l border-fp-border">
        <MapPanel places={places} clusterLabel="La Libertad Cluster" />
      </aside>

      {/* ── Mobile map sheet ── */}
      {mapOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMapOpen(false)} />
          <div className="relative mt-auto h-[70vh] bg-fp-dark border-t border-fp-border z-10 rounded-t-2xl overflow-hidden">
            <button
              onClick={() => setMapOpen(false)}
              className="absolute top-4 right-4 z-20 fp-overlay-close-btn hover:text-fp-cream rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            <MapPanel places={places} clusterLabel="La Libertad Cluster" />
          </div>
        </div>
      )}
    </div>
  );
}
