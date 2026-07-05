"use client";

import { useTranslations } from "next-intl";
import { EXPLORE_CATEGORIES } from "@/features/search/explore-categories";
import { useSearchNavigation } from "./SearchNavigationProvider";

export default function HomeCategories() {
  const t = useTranslations("home");
  const { startSearch, isSearching } = useSearchNavigation();

  return (
    <div>
      <p className="hero-viral-label text-[0.7rem] font-semibold tracking-[0.12em] uppercase mb-3">
        {t("categoriesLabel")}
      </p>
      <div className="flex flex-wrap gap-2">
        {EXPLORE_CATEGORIES.map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            disabled={isSearching}
            onClick={() => startSearch(t(`categories.${id}`), id)}
            className="tag-pill disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span aria-hidden="true">{icon}</span>
            {t(`categories.${id}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
