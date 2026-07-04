"use client";

import { useSearchNavigation } from "./SearchNavigationProvider";

interface Props {
  query: string;
  children: React.ReactNode;
  className?: string;
}

export default function TagSearchLink({ query, children, className }: Props) {
  const { startSearch } = useSearchNavigation();

  return (
    <button
      type="button"
      onClick={() => startSearch(query)}
      className={className}
    >
      {children}
    </button>
  );
}
