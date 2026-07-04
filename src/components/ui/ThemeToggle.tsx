"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-10 h-5 rounded-full border border-fp-border bg-fp-surface transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fp-teal"
    >
      <span className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none select-none text-[0.55rem]">
        <MoonIcon className={isDark ? "opacity-80" : "opacity-30"} />
        <SunIcon className={isDark ? "opacity-30" : "opacity-80"} />
      </span>

      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all duration-300 ${
          isDark
            ? "left-0.5 bg-fp-teal"
            : "left-[calc(100%-1.125rem)] bg-fp-coral"
        }`}
      />
    </button>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-fp-cream transition-opacity ${className ?? ""}`}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={`text-fp-cream transition-opacity ${className ?? ""}`}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
