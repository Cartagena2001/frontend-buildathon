"use client";

import { useSearchParams } from "next/navigation";
import SearchBar from "@/features/search/components/SearchBar";

export default function ExploreSearchBar() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  return <SearchBar initialQuery={initialQuery} />;
}
