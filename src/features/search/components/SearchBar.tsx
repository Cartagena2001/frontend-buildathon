"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("home");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
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
        className="fp-input flex-1 bg-transparent text-fp-dark placeholder:text-gray-400 text-[0.95rem] px-6 py-4 font-sans"
      />
      <button
        type="submit"
        className="m-1 px-6 py-3 rounded-full bg-fp-red text-fp-cream text-sm font-semibold hover:bg-fp-cyan hover:text-fp-dark transition-colors shrink-0"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
