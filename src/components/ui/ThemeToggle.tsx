"use client";

import { useTheme } from "./ThemeProvider";

type ThemeToggleProps = {
  variant?: "default" | "hero";
};

export default function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const isHero = variant === "hero";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative h-5 w-10 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fp-teal ${
        isHero
          ? "border border-white/30 bg-white/10"
          : "border border-fp-border bg-fp-surface"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 flex select-none items-center justify-between px-1 text-[0.55rem]">
        <MoonIcon
          isHero={isHero}
          className={isDark ? "opacity-80" : "opacity-30"}
        />
        <SunIcon
          isHero={isHero}
          className={isDark ? "opacity-30" : "opacity-80"}
        />
      </span>

      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full shadow transition-all duration-300 ${
          isDark
            ? "left-0.5 bg-fp-teal"
            : "left-[calc(100%-1.125rem)] bg-fp-coral"
        }`}
      />
    </button>
  );
}

function MoonIcon({
  className,
  isHero,
}: {
  className?: string;
  isHero: boolean;
}) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`transition-opacity ${isHero ? "text-white" : "text-fp-cream"} ${className ?? ""}`}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon({
  className,
  isHero,
}: {
  className?: string;
  isHero: boolean;
}) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={`transition-opacity ${isHero ? "text-white" : "text-fp-cream"} ${className ?? ""}`}
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
