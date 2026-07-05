"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PlaceList } from "@/features/place-lists/types";

interface Props {
  list: PlaceList;
}

export default function ListCard({ list }: Props) {
  const t = useTranslations("lists");

  return (
    <Link
      href={`/lists/${list.id}`}
      className="glass rounded-2xl p-5 flex flex-col gap-3 hover:border-fp-cyan/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-fp-cream text-lg leading-tight group-hover:text-fp-cyan transition-colors truncate">
            {list.name}
          </h2>
          {list.description && (
            <p className="text-fp-muted text-sm mt-1 line-clamp-2">{list.description}</p>
          )}
        </div>
        {list.isShared && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider bg-fp-cyan/15 text-fp-cyan border border-fp-cyan/30">
            {t("shared")}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-fp-muted text-xs">
          {t("placeCount", { count: list.placeCount })}
        </span>
        <span className="text-fp-cyan text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          {t("viewList")} →
        </span>
      </div>
    </Link>
  );
}
