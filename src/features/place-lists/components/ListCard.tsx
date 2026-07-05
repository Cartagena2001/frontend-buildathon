"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import PlaceCoverCollage from "@/features/place-lists/components/PlaceCoverCollage";
import type { PlaceListWithPreviews } from "@/features/place-lists/actions";
import { getListCardGradient } from "@/features/place-lists/place-cover";
import { formatAppDate } from "@/lib/format-date";

interface Props {
  list: PlaceListWithPreviews;
  index?: number;
}

export default function ListCard({ list, index = 0 }: Props) {
  const t = useTranslations("lists");
  const locale = useLocale();
  const gradient = getListCardGradient(list.id);
  const hasCovers = list.previewCovers.length > 0;

  const updated = formatAppDate(list.updatedAt, locale);

  return (
    <Link
      href={`/lists/${list.id}`}
      className="group block bg-fp-dim border border-fp-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-fp-coral/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 fade-up"
      style={{ animationDelay: `${Math.min(index, 5) * 0.08}s` }}
    >
      <div className={`relative h-36 sm:h-40 overflow-hidden ${hasCovers ? "" : `bg-gradient-to-br ${gradient}`}`}>
        {hasCovers ? (
          <>
            <PlaceCoverCollage covers={list.previewCovers} alt={list.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-fp-dim/90 via-fp-dim/20 to-transparent" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, var(--fp-brand-coral) 0%, transparent 45%), radial-gradient(circle at 80% 20%, var(--fp-brand-teal) 0%, transparent 40%)",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--fp-dim)_0%,transparent_55%)]" />
          </>
        )}

        <span className="absolute top-3 left-3 w-9 h-9 rounded-full fp-badge-overlay flex items-center justify-center text-fp-coral">
          <BookmarkIcon />
        </span>

        {list.isShared && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-wider bg-fp-teal/90 text-white shadow-sm">
            {t("shared")}
          </span>
        )}

        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-fp-coral text-white text-[0.65rem] font-bold tracking-wide shadow-sm">
          {t("placeCount", { count: list.placeCount })}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <h2 className="font-display text-fp-cream text-lg sm:text-xl leading-tight mb-1.5 group-hover:text-fp-coral transition-colors line-clamp-1">
          {list.name}
        </h2>
        {list.description ? (
          <p className="text-fp-muted text-sm leading-relaxed line-clamp-2 min-h-10">
            {list.description}
          </p>
        ) : (
          <p className="text-fp-muted/60 text-sm italic min-h-10">
            {t("noDescription")}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-fp-border/70">
          <span className="text-fp-muted text-[0.65rem] font-semibold uppercase tracking-widest">
            {updated}
          </span>
          <span className="inline-flex items-center gap-1 text-fp-coral text-xs font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
            {t("viewList")}
            <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
