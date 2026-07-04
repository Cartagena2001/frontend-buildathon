"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Theme } from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem("fp-theme");
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

export default function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");

    const stored = readStoredTheme();
    const resolved = stored ?? initialTheme;

    document.body.setAttribute("data-theme", resolved);
    localStorage.setItem("fp-theme", resolved);
    document.cookie = `fp-theme=${resolved};path=/;max-age=31536000;samesite=lax`;
    setTheme(resolved);
  }, [initialTheme]);

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
