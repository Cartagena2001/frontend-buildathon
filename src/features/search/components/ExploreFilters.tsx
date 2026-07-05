"use client";

import { useTranslations } from "next-intl";

const SENTIMENTS = ["positive", "neutral", "negative"] as const;
type Sentiment = typeof SENTIMENTS[number];

const RANKINGS = ["likes", "comments", "views"] as const;
type Ranking = typeof RANKINGS[number];

const CATEGORIES = [
  { id: "all",           label: "All",            icon: "✦"  },
  { id: "restaurant",    label: "Restaurants",     icon: "🍽️" },
  { id: "shopping",      label: "Shopping",        icon: "🛍️" },
  { id: "nightlife",     label: "Nightlife",       icon: "✦"  },
  { id: "active",        label: "Active Life",     icon: "🎯" },
  { id: "beauty",        label: "Beauty & Spas",   icon: "✂️" },
  { id: "automotive",    label: "Automotive",      icon: "🚗" },
  { id: "home-services", label: "Home Services",   icon: "🏠" },
  { id: "beach",         label: "Beaches",         icon: "🏖️" },
  { id: "other",         label: "More",            icon: "···" },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

interface Props {
  sentiment:    Sentiment | null;
  ranking:      Ranking | null;
  category:     CategoryId;
  onSentiment:  (v: Sentiment | null)  => void;
  onRanking:    (v: Ranking | null)    => void;
  onCategory:   (v: CategoryId)        => void;
}

const sentimentConfig: Record<Sentiment, { label: string; color: string; dot: string }> = {
  positive: { label: "Positive", color: "text-fp-teal",   dot: "bg-fp-teal"   },
  neutral:  { label: "Neutral",  color: "text-fp-cream",  dot: "bg-fp-muted"  },
  negative: { label: "Negative", color: "text-fp-orange", dot: "bg-fp-orange" },
};

const rankingConfig: Record<Ranking, { label: string; icon: React.ReactNode }> = {
  likes:    { label: "Most Likes",    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  comments: { label: "Most Comments", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  views:    { label: "Most Views",    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
};

export default function ExploreFilters({
  sentiment, ranking, category,
  onSentiment, onRanking, onCategory,
}: Props) {
  return (
    <aside className="flex flex-col gap-7 py-7 px-5 h-full overflow-y-auto">

      {/* ── Sentiment ── */}
      <div>
        <p className="text-fp-muted text-[0.6rem] font-bold uppercase tracking-[0.18em] mb-3">
          Sentiment
        </p>
        <div className="space-y-2.5">
          {SENTIMENTS.map((s) => {
            const { label, color, dot } = sentimentConfig[s];
            const active = sentiment === s;
            return (
              <button
                key={s}
                onClick={() => onSentiment(active ? null : s)}
                className="flex items-center gap-2.5 w-full group"
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  active ? "border-fp-coral bg-fp-coral" : "border-fp-border group-hover:border-fp-coral/60"
                }`}>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-fp-dark" />}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className={`text-sm transition-colors ${active ? color : "text-fp-muted group-hover:text-fp-coral"}`}>
                    {label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-fp-border" />

      {/* ── Ranking ── */}
      <div>
        <p className="text-fp-muted text-[0.6rem] font-bold uppercase tracking-[0.18em] mb-3">
          Ranking
        </p>
        <div className="space-y-2.5">
          {RANKINGS.map((r) => {
            const { label, icon } = rankingConfig[r];
            const active = ranking === r;
            return (
              <button
                key={r}
                onClick={() => onRanking(active ? null : r)}
                className="flex items-center gap-2.5 w-full group"
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  active ? "border-fp-coral bg-fp-coral" : "border-fp-border group-hover:border-fp-coral/60"
                }`}>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-fp-dark" />}
                </span>
                <span className={`flex items-center gap-1.5 text-sm transition-colors ${active ? "text-fp-cream" : "text-fp-muted group-hover:text-fp-coral"}`}>
                  <span className={active ? "text-fp-coral" : "text-fp-muted"}>{icon}</span>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-fp-border" />

      {/* ── Categories ── */}
      <div>
        <p className="text-fp-muted text-[0.6rem] font-bold uppercase tracking-[0.18em] mb-3">
          Category
        </p>
        <div className="space-y-1">
          {CATEGORIES.map(({ id, label }) => {
            const active = category === id;
            return (
              <button
                key={id}
                onClick={() => onCategory(id as CategoryId)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-fp-coral/15 text-fp-coral border border-fp-coral/30"
                    : "text-fp-muted hover:text-fp-cream hover:bg-fp-surface/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
