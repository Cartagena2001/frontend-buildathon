import { cookies } from "next/headers";

export type Theme = "dark" | "light";

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  const value = store.get("fp-theme")?.value;
  if (value === "light" || value === "dark") return value;
  return "light";
}
