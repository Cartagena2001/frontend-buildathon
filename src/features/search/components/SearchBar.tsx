"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchNavigation } from "./SearchNavigationProvider";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const { startSearch, isSearching } = useSearchNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("home");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    startSearch(query);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full rounded-full bg-white overflow-hidden shadow-2xl shadow-black/40"
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        disabled={isSearching}
        className="fp-input flex-1 bg-transparent text-fp-cream placeholder:text-fp-muted text-[0.95rem] px-6 py-4 font-sans disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        className="m-1 px-6 py-3 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-coral transition-colors shrink-0"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
