"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { ExploreCategoryId } from "../filter-places";
import { fetchSearchResults } from "../search-client";
import { setCachedResults } from "../search-results-cache";

/** Failsafe: nunca dejar el overlay colgado si el endpoint se cuelga */
const MAX_OVERLAY_MS = 15000;
const IMMEDIATE_OVERLAY_ID = "search-loading-fallback";

interface SearchNavigationContextValue {
  isSearching: boolean;
  searchSession: number;
  startSearch: (query: string, category?: ExploreCategoryId) => void;
}

const SearchNavigationContext =
  createContext<SearchNavigationContextValue | null>(null);

export function useSearchNavigation() {
  const ctx = useContext(SearchNavigationContext);
  if (!ctx) {
    throw new Error(
      "useSearchNavigation must be used within SearchNavigationProvider",
    );
  }
  return ctx;
}

function lockPageScroll() {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockPageScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

function showImmediateOverlay(title: string, subtitle: string) {
  if (typeof document === "undefined") return;
  if (document.getElementById(IMMEDIATE_OVERLAY_ID)) return;

  const overlay = document.createElement("div");
  overlay.id = IMMEDIATE_OVERLAY_ID;
  overlay.className =
    "mascot-loading-overlay mascot-loading-overlay--fallback";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.setAttribute("aria-busy", "true");

  const viewport = document.createElement("div");
  viewport.className = "mascot-loading-overlay__viewport";

  const shell = document.createElement("div");
  shell.className =
    "mascot-loading-overlay__shell mascot-loading-overlay__shell--text-only";

  const pulse = document.createElement("div");
  pulse.className = "mascot-loading-fallback__pulse";
  pulse.setAttribute("aria-hidden", "true");

  const copy = document.createElement("div");
  copy.className =
    "mascot-loading-overlay__copy mascot-loading-fallback__copy";

  const titleEl = document.createElement("p");
  titleEl.className = "mascot-loading-fallback__title";
  titleEl.textContent = title;

  const subtitleEl = document.createElement("p");
  subtitleEl.className = "mascot-loading-fallback__subtitle";
  subtitleEl.textContent = subtitle;

  const progress = document.createElement("div");
  progress.className = "mascot-loading-fallback__progress";
  progress.setAttribute("aria-hidden", "true");

  const progressFill = document.createElement("div");
  progressFill.className = "mascot-loading-fallback__progress-fill";

  copy.append(titleEl, subtitleEl);
  progress.append(progressFill);
  shell.append(pulse, copy, progress);
  viewport.append(shell);
  overlay.append(viewport);
  document.body.append(overlay);
}

function hideImmediateOverlay() {
  if (typeof document === "undefined") return;
  document.getElementById(IMMEDIATE_OVERLAY_ID)?.remove();
}

function destinationQuery(destination: string): string {
  const search = destination.split("?")[1] ?? "";
  return new URLSearchParams(search).get("q")?.trim() ?? "";
}

export function SearchNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("loading");
  const [isSearching, setIsSearching] = useState(false);
  const [searchSession, setSearchSession] = useState(0);
  const isSearchingRef = useRef(false);
  const destinationRef = useRef<string | null>(null);
  const hasNavigatedRef = useRef(false);
  const failsafeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSearchTimers = useCallback(() => {
    if (failsafeTimer.current) {
      clearTimeout(failsafeTimer.current);
      failsafeTimer.current = null;
    }
  }, []);

  const dismissOverlay = useCallback(() => {
    clearSearchTimers();
    hideImmediateOverlay();
    destinationRef.current = null;
    hasNavigatedRef.current = false;
    isSearchingRef.current = false;
    setIsSearching(false);
  }, [clearSearchTimers]);

  const navigateToDestination = useCallback(
    (destination: string) => {
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;
      destinationRef.current = destination;

      try {
        router.push(destination);
      } catch {
        dismissOverlay();
      }
    },
    [router, dismissOverlay],
  );

  const startSearch = useCallback(
    (query: string, category?: ExploreCategoryId) => {
      const trimmed = query.trim();
      if (!trimmed || isSearchingRef.current) return;

      clearSearchTimers();

      const categoryParam =
        category && category !== "all"
          ? `&category=${encodeURIComponent(category)}`
          : "";
      const destination = `/explore?q=${encodeURIComponent(trimmed)}${categoryParam}`;

      lockPageScroll();
      showImmediateOverlay(t("search.title"), t("search.subtitle"));

      setSearchSession((s) => s + 1);
      destinationRef.current = destination;
      hasNavigatedRef.current = false;
      isSearchingRef.current = true;
      setIsSearching(true);

      failsafeTimer.current = setTimeout(() => {
        navigateToDestination(destination);
        dismissOverlay();
      }, MAX_OVERLAY_MS);

      // The cat animation stays visible for exactly the endpoint round-trip:
      // once results (or an error) come back we cache them and navigate.
      fetchSearchResults(trimmed)
        .then((results) => setCachedResults(trimmed, results))
        .catch(() => setCachedResults(trimmed, { places: [], relatedPlaces: [] }))
        .finally(() => {
          if (failsafeTimer.current) {
            clearTimeout(failsafeTimer.current);
            failsafeTimer.current = null;
          }
          navigateToDestination(destination);
        });
    },
    [navigateToDestination, dismissOverlay, clearSearchTimers, t],
  );

  useEffect(() => {
    if (!isSearching || !destinationRef.current || !hasNavigatedRef.current) return;

    const targetPath = destinationRef.current.split("?")[0] ?? destinationRef.current;
    const targetQuery = destinationQuery(destinationRef.current);
    const currentQuery = searchParams.get("q")?.trim() ?? "";

    if (
      (pathname === targetPath || pathname.startsWith(`${targetPath}/`)) &&
      targetQuery === currentQuery
    ) {
      dismissOverlay();
    }
  }, [pathname, searchParams, isSearching, dismissOverlay]);

  useEffect(() => {
    if (!isSearching) return;

    lockPageScroll();
    return () => {
      unlockPageScroll();
    };
  }, [isSearching]);

  useEffect(() => {
    return () => {
      clearSearchTimers();
      hideImmediateOverlay();
      isSearchingRef.current = false;
      unlockPageScroll();
    };
  }, [clearSearchTimers]);

  return (
    <SearchNavigationContext.Provider
      value={{ isSearching, searchSession, startSearch }}
    >
      {children}
    </SearchNavigationContext.Provider>
  );
}
