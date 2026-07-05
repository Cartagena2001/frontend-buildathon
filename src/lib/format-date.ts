/** Stable locale for SSR + client — avoids hydration mismatches from `undefined` locale. */
export function formatAppDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-SV" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
