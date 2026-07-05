"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { ExploreSentiment, ExploreSort } from "@/features/search/filter-places";

const SENTIMENTS = ["positive", "neutral", "negative"] as const;

const RANKINGS = ["likes", "comments", "views"] as const;

interface Props {
  sentiment: ExploreSentiment | null;
  sort: ExploreSort;
  excludeSuspicious: boolean;
  onSentiment: (value: ExploreSentiment | null) => void;
  onSort: (value: ExploreSort) => void;
  onExcludeSuspicious: (value: boolean) => void;
  onClose?: () => void;
}

const sentimentConfig: Record<ExploreSentiment, { label: string; dot: string }> = {
  positive: { label: "Positive", dot: "bg-fp-teal" },
  neutral: { label: "Neutral", dot: "bg-fp-muted" },
  negative: { label: "Negative", dot: "bg-fp-orange" },
};

const rankingIcons: Record<(typeof RANKINGS)[number], ReactNode> = {
  likes: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  comments: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  views: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export default function ExploreFilters({
  sentiment,
  sort,
  excludeSuspicious,
  onSentiment,
  onSort,
  onExcludeSuspicious,
  onClose,
}: Props) {
  const t = useTranslations("explore");

  // "Most Likes" is the neutral baseline, so it doesn't read as an active filter on load.
  const activeCount =
    (sentiment ? 1 : 0) + (sort !== "likes" ? 1 : 0) + (!excludeSuspicious ? 1 : 0);

  const clearAll = () => {
    onSentiment(null);
    onSort("likes");
    onExcludeSuspicious(true);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
      {/* ── Panel header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base leading-none text-fp-cream">
            {t("filters.title")}
          </h2>
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-fp-coral px-1 text-[0.6rem] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearAll}
            disabled={activeCount === 0}
            className="rounded-md text-xs font-medium text-fp-coral transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fp-coral/40 disabled:pointer-events-none disabled:opacity-0"
          >
            {t("filters.clearAll")}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="-mr-1.5 flex h-7 w-7 items-center justify-center rounded-full text-fp-muted transition-colors hover:bg-fp-surface hover:text-fp-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fp-coral/40 lg:hidden"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Location quality ── */}
        <FilterSection label={t("filters.locationQuality")}>
          <div className="rounded-xl border border-fp-border bg-fp-surface p-3">
            <div className="flex items-start justify-between gap-3">
              <label htmlFor="exclude-suspicious" className="cursor-pointer">
                <span className="block text-sm text-fp-cream">
                  {t("filters.excludeSuspicious")}
                </span>
                <span className="mt-0.5 block text-[0.7rem] leading-snug text-fp-muted">
                  {t("filters.excludeSuspiciousHint")}
                </span>
              </label>
              <Switch
                id="exclude-suspicious"
                checked={excludeSuspicious}
                onChange={() => onExcludeSuspicious(!excludeSuspicious)}
                label={t("filters.excludeSuspicious")}
              />
            </div>
          </div>
        </FilterSection>

        {/* ── Sentiment ── */}
        <FilterSection label={t("sentiment")}>
          <div className="flex flex-col gap-1">
            {SENTIMENTS.map((value) => {
              const { label, dot } = sentimentConfig[value];
              const active = sentiment === value;
              return (
                <OptionRow
                  key={value}
                  active={active}
                  onClick={() => onSentiment(active ? null : value)}
                  leading={<span className={`h-2.5 w-2.5 rounded-full ${dot}`} />}
                  label={label}
                />
              );
            })}
          </div>
        </FilterSection>

        {/* ── Ranking ── */}
        <FilterSection label={t("filters.ranking")}>
          <div className="flex flex-col gap-1">
            {RANKINGS.map((value) => {
              const active = sort === value;
              return (
                <OptionRow
                  key={value}
                  active={active}
                  onClick={() => onSort(value)}
                  leading={rankingIcons[value]}
                  label={t(`sortOptions.${value}`)}
                />
              );
            })}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-fp-muted">
        {label}
      </p>
      {children}
    </section>
  );
}

function OptionRow({
  active,
  onClick,
  leading,
  label,
}: {
  active: boolean;
  onClick: () => void;
  leading: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fp-coral/40 ${
        active
          ? "bg-fp-coral/10 text-fp-coral"
          : "text-fp-muted hover:bg-fp-surface hover:text-fp-cream"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center transition-colors ${
          active ? "text-fp-coral" : "text-fp-muted group-hover:text-fp-cream"
        }`}
      >
        {leading}
      </span>
      <span className="flex-1 font-medium">{label}</span>
      <span
        className={`transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-fp-coral">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </button>
  );
}

function Switch({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fp-coral/40 ${
        checked ? "bg-fp-coral" : "bg-fp-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
