"use client";

import { useEffect, type ReactNode } from "react";
import MascotLoadingOverlay from "@/components/mascot/MascotLoadingOverlay";
import { MASCOT_ASSETS } from "@/components/mascot/types";
import { SearchNavigationProvider, useSearchNavigation } from "@/features/search/components/SearchNavigationProvider";

function MascotAssetPreload() {
  useEffect(() => {
    const { mp4, poster } = MASCOT_ASSETS.search;

    for (const [href, as] of [
      [poster, "image"],
      [mp4, "video"],
    ] as const) {
      if (document.querySelector(`link[rel="preload"][href="${href}"]`)) continue;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = as;
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  return null;
}

function SearchOverlayGate() {
  const { isSearching, searchSession } = useSearchNavigation();
  if (!isSearching) return null;
  return <MascotLoadingOverlay key={searchSession} variant="search" />;
}

export default function SearchLoadingRoot({ children }: { children: ReactNode }) {
  return (
    <SearchNavigationProvider>
      <MascotAssetPreload />
      {children}
      <SearchOverlayGate />
    </SearchNavigationProvider>
  );
}
