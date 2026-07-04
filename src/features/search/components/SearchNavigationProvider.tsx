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
import { useRouter } from "@/i18n/navigation";

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

export function SearchNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchSession, setSearchSession] = useState(0);
  const isSearchingRef = useRef(false);
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

  const finishSearch = useCallback(
    (destination: string) => {
      if (!isSearchingRef.current) return;

      clearSearchTimers();
      isSearchingRef.current = false;
      setIsSearching(false);

      try {
        router.push(destination);
      } catch {
        // Overlay already dismissed; navigation failure is non-fatal.
      }
    },
    [router, clearSearchTimers],
  );

  const startSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || isSearchingRef.current) return;

      clearSearchTimers();

      const destination = `/explore?q=${encodeURIComponent(trimmed)}`;

      document.body.style.overflow = "hidden";

      setSearchSession((s) => s + 1);
      isSearchingRef.current = true;
      setIsSearching(true);

      navigateTimer.current = setTimeout(() => {
        finishSearch(destination);
      }, MIN_OVERLAY_MS);

      failsafeTimer.current = setTimeout(() => {
        finishSearch(destination);
      }, MAX_OVERLAY_MS);
    },
    [finishSearch, clearSearchTimers],
  );

  useEffect(() => {
    if (!isSearching) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSearching]);

  useEffect(() => {
    return () => {
      clearSearchTimers();
      isSearchingRef.current = false;
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
