"use client";

import { useState } from "react";
import { useSearchNavigation } from "./SearchNavigationProvider";

interface Props {
  initialQuery?: string;
}

export default function ExploreSearchBar({ initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const { startSearch, isSearching } = useSearchNavigation();

  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    startSearch(query);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center fp-search-bar rounded-full px-4 py-2 gap-2"
    >
      <button
        type="submit"
        aria-label="Search"
        disabled={isSearching}
        className="shrink-0 text-fp-muted hover:text-fp-coral transition-colors disabled:cursor-not-allowed"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </button>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search places…"
        disabled={isSearching}
        className="flex-1 min-w-0 bg-transparent text-fp-cream placeholder:text-fp-muted text-sm outline-none disabled:cursor-not-allowed"
      />
    </form>
  );
}
