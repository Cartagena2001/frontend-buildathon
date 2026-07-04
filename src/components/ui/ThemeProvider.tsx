"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Theme } from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function resolveTheme(): Theme {
  const stored = localStorage.getItem("fp-theme");
  if (stored === "light" || stored === "dark") return stored;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Remove legacy attribute from older builds that set theme on <html>.
    document.documentElement.removeAttribute("data-theme");

    const resolved = resolveTheme();
    document.body.setAttribute("data-theme", resolved);
    localStorage.setItem("fp-theme", resolved);
    document.cookie = `fp-theme=${resolved};path=/;max-age=31536000;samesite=lax`;
    setTheme(resolved);
  }, []);

  function apply(next: Theme) {
    document.documentElement.removeAttribute("data-theme");
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("fp-theme", next);
    document.cookie = `fp-theme=${next};path=/;max-age=31536000;samesite=lax`;
    setTheme(next);
  }

  function toggle() {
    apply(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
