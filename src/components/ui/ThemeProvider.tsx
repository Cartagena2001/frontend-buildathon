"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

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

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");

  // On mount: read stored preference or system preference
  useEffect(() => {
    const stored = localStorage.getItem("fp-theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      apply(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      apply(prefersDark ? "dark" : "light");
    }
  }, []);

  function apply(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fp-theme", next);
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
