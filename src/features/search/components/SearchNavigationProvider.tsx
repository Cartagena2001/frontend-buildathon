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
import { usePathname, useRouter } from "@/i18n/navigation";

/** Tiempo mínimo visible antes de navegar a /explore */
const MIN_OVERLAY_MS = 3200;
/** Failsafe: nunca dejar el overlay colgado */
const MAX_OVERLAY_MS = 8000;

interface SearchNavigationContextValue {
  isSearching: boolean;
  searchSession: number;
  startSearch: (query: string) => void;
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

export function SearchNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [searchSession, setSearchSession] = useState(0);
  const isSearchingRef = useRef(false);
  const destinationRef = useRef<string | null>(null);
  const hasNavigatedRef = useRef(false);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSearchTimers = useCallback(() => {
    if (navigateTimer.current) {
      clearTimeout(navigateTimer.current);
      navigateTimer.current = null;
    }
    if (failsafeTimer.current) {
      clearTimeout(failsafeTimer.current);
      failsafeTimer.current = null;
    }
  }, []);

  const dismissOverlay = useCallback(() => {
    clearSearchTimers();
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
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || isSearchingRef.current) return;

      clearSearchTimers();

      const destination = `/explore?q=${encodeURIComponent(trimmed)}`;

      lockPageScroll();

      setSearchSession((s) => s + 1);
      destinationRef.current = destination;
      hasNavigatedRef.current = false;
      isSearchingRef.current = true;
      setIsSearching(true);

      navigateTimer.current = setTimeout(() => {
        navigateToDestination(destination);
      }, MIN_OVERLAY_MS);

      failsafeTimer.current = setTimeout(() => {
        navigateToDestination(destination);
        dismissOverlay();
      }, MAX_OVERLAY_MS);
    },
    [navigateToDestination, dismissOverlay, clearSearchTimers],
  );

  useEffect(() => {
    if (!isSearching || !destinationRef.current) return;

    const targetPath = destinationRef.current.split("?")[0] ?? destinationRef.current;
    if (pathname === targetPath || pathname.startsWith(`${targetPath}/`)) {
      dismissOverlay();
    }
  }, [pathname, isSearching, dismissOverlay]);

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
