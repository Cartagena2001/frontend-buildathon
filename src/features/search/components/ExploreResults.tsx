"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PlaceList from "@/features/places/components/PlaceList";
import type { Place } from "@/features/places/types";

const MapView = dynamic(() => import("@/features/map/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-fp-dim text-fp-muted text-sm">
      …
    </div>
  ),
});

interface ExploreResultsProps {
  places: Place[];
  query: string;
}

export default function ExploreResults({ places, query }: ExploreResultsProps) {
  const t = useTranslations("explore");
  const [selectedId, setSelectedId] = useState<string | null>(
    places[0]?.id_place ?? null,
  );

  function handleSelectPlace(id: string) {
    setSelectedId(id);
    const element = document.getElementById(`place-${id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] min-h-0">
      <section className="flex min-h-0 w-full flex-col lg:w-[42%]">
        <div className="border-b border-fp-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fp-muted">
            {t("resultsFor")}
          </p>
          <h2 className="font-display text-2xl text-fp-cream mt-1">
            &ldquo;{query}&rdquo;
          </h2>
          <p className="text-sm text-fp-muted mt-1">
            {t("resultCount", { count: places.length })}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <PlaceList
            places={places}
            selectedId={selectedId}
            onSelectPlace={handleSelectPlace}
          />
        </div>
      </section>

      <section
        aria-label={t("mapLabel")}
        className="hidden lg:block lg:w-[58%] shrink-0 border-l border-fp-border"
      >
        <MapView
          places={places}
          selectedId={selectedId}
          onSelectPlace={handleSelectPlace}
        />
      </section>
    </div>
  );
}
