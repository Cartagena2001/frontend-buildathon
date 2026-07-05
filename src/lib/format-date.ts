/** Stable locale for SSR + client — avoids hydration mismatches from `undefined` locale. */
export function formatAppDate(value: string | Date, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(locale === "es" ? "es-SV" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
