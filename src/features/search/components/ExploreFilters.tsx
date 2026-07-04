"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const VIBES = ["highEnergy", "chillRelaxed", "hiddenGem", "aesthetic"] as const;
const CATEGORIES = ["all", "beaches", "restaurants", "nightlife", "cafes"] as const;

type Vibe = (typeof VIBES)[number];
type Category = (typeof CATEGORIES)[number];

export default function ExploreFilters() {
  const t = useTranslations("explore");
  const router = useRouter();
  const pathname = usePathname();

  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [growth, setGrowth] = useState(50);

  function applyCategory(cat: Category) {
    setSelectedCategory(cat);
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="flex flex-col gap-8 py-8 px-6 h-full overflow-y-auto">
      {/* Filter by vibe */}
      <div>
        <p className="text-fp-muted text-[0.62rem] font-bold uppercase tracking-[0.16em] mb-4">
          {t("filterByVibe")}
        </p>
        <div className="space-y-3">
          {VIBES.map((vibe) => (
            <button
              key={vibe}
              onClick={() => setSelectedVibe(selectedVibe === vibe ? null : vibe)}
              className="flex items-center gap-3 w-full group"
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selectedVibe === vibe
                    ? "border-fp-cyan bg-fp-cyan"
                    : "border-fp-border group-hover:border-fp-rose"
                }`}
              >
                {selectedVibe === vibe && (
                  <span className="w-1.5 h-1.5 rounded-full bg-fp-dark" />
                )}
              </span>
              <span
                className={`text-sm transition-colors ${
                  selectedVibe === vibe ? "text-fp-cream" : "text-fp-muted group-hover:text-fp-cream"
                }`}
              >
                {t(`vibes.${vibe}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-fp-border" />

      {/* Category */}
      <div>
        <p className="text-fp-muted text-[0.62rem] font-bold uppercase tracking-[0.16em] mb-4">
          {t("category")}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => applyCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-fp-red text-fp-on-accent"
                  : "border border-fp-border text-fp-muted hover:text-fp-cream hover:border-fp-rose/50"
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-fp-border" />

      {/* Trending growth slider */}
      <div>
        <p className="text-fp-muted text-[0.62rem] font-bold uppercase tracking-[0.16em] mb-4">
          {t("trendingGrowth")}
        </p>
        <input
          type="range"
          min={0}
          max={100}
          value={growth}
          onChange={(e) => setGrowth(Number(e.target.value))}
          className="w-full accent-fp-red cursor-pointer"
        />
        <p className="text-fp-muted text-[0.68rem] mt-2 leading-4">
          {t("trendingHint")}
        </p>
      </div>
    </aside>
  );
}
