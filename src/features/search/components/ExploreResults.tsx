"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ExploreLayout from "./ExploreLayout";
import MascotLoadingOverlay from "@/components/mascot/MascotLoadingOverlay";
import { fetchSearchResults } from "../search-client";
import { getCachedResults, setCachedResults } from "../search-results-cache";
import {
  filterAndSortPlaces,
  type ExploreCategoryId,
  type ExploreSentiment,
  type ExploreSort,
} from "../filter-places";
import type { PlaceCardData } from "@/features/places/components/PlaceCard";

interface Props {
  query: string;
  initialCategory?: ExploreCategoryId;
  savedPlaceIds: string[];
}

const SORT_OPTIONS: ExploreSort[] = ["viral", "likes", "comments", "views"];

export default function ExploreResults({
  query,
  initialCategory = "all",
  savedPlaceIds,
}: Props) {
  const t = useTranslations("explore");
  const [places, setPlaces] = useState<PlaceCardData[]>([]);
  const [relatedPlaces, setRelatedPlaces] = useState<PlaceCardData[]>([]);
  // Start false so SSR and the first client render match; enable in useEffect after mount.
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState<ExploreSentiment | null>(null);
  const [sort, setSort] = useState<ExploreSort>("likes");
  const [category, setCategory] = useState<ExploreCategoryId>(initialCategory);
  const [excludeSuspicious, setExcludeSuspicious] = useState(true);
  const [prevQuery, setPrevQuery] = useState(query);
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setLoading(false);
    setSentiment(null);
    setSort("likes");
    setCategory("all");
    setExcludeSuspicious(true);
  }

  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    setCategory(initialCategory);
  }

  useEffect(() => {
    if (!query) {
      setPlaces([]);
      setRelatedPlaces([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      const hit = getCachedResults(query);
      if (hit) {
        if (!active) return;
        setPlaces(hit.places);
        setRelatedPlaces(hit.relatedPlaces);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const results = await fetchSearchResults(query);
        if (!active) return;
        setCachedResults(query, results);
        setPlaces(results.places);
        setRelatedPlaces(results.relatedPlaces);
      } catch {
        if (active) {
          setPlaces([]);
          setRelatedPlaces([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [query]);

  const displayPlaces = useMemo(() => (query ? places : []), [query, places]);
  const displayRelatedPlaces = useMemo(
    () => (query ? relatedPlaces : []),
    [query, relatedPlaces],
  );
  const isLoading = Boolean(query && loading);

  const filteredCount = useMemo(() => {
    const filterState = { sentiment, category, sort, excludeSuspicious };
    return (
      filterAndSortPlaces(displayPlaces, filterState).length +
      filterAndSortPlaces(displayRelatedPlaces, filterState).length
    );
  }, [displayPlaces, displayRelatedPlaces, sentiment, category, sort, excludeSuspicious]);

  return (
    <>
      {isLoading ? <MascotLoadingOverlay variant="search" /> : null}

      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-fp-border">
        <div>
          <h1 className="font-display text-fp-cream text-xl sm:text-2xl leading-tight">
            {t("title")}
          </h1>
          <p className="text-fp-muted text-xs mt-0.5 hidden sm:block">
            {t("subtitle", {
              count: String(filteredCount),
              clips: "1,420",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-fp-muted text-xs hidden sm:block">
            {t("sortedBy")}
          </span>
          <SortDropdown sort={sort} onSort={setSort} />
        </div>
      </div>

      <ExploreLayout
        places={displayPlaces}
        relatedPlaces={displayRelatedPlaces}
        mapReady={!isLoading}
        savedPlaceIds={savedPlaceIds}
        sentiment={sentiment}
        sort={sort}
        category={category}
        excludeSuspicious={excludeSuspicious}
        onSentiment={setSentiment}
        onSort={setSort}
        onExcludeSuspicious={setExcludeSuspicious}
      />
    </>
  );
}

function SortDropdown({
  sort,
  onSort,
}: {
  sort: ExploreSort;
  onSort: (value: ExploreSort) => void;
}) {
  const t = useTranslations("explore.sortOptions");

  return (
    <label className="relative flex items-center gap-1.5 border border-fp-border rounded-full px-3 py-1.5 cursor-pointer hover:border-fp-coral/50 transition-colors">
      <select
        value={sort}
        onChange={(event) => onSort(event.target.value as ExploreSort)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={t("viral")}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(option === "viral" ? "viral" : option)}
          </option>
        ))}
      </select>
      <span className="font-sans text-fp-cream text-xs font-medium whitespace-nowrap pointer-events-none">
        {t(sort === "viral" ? "viral" : sort)}
      </span>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-fp-muted shrink-0 pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}
