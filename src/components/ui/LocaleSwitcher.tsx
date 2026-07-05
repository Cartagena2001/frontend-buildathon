"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type LocaleSwitcherProps = {
  variant?: "default" | "hero";
};

export default function LocaleSwitcher({ variant = "default" }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isHero = variant === "hero";

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-0.5">
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        const className = isHero
          ? isActive
            ? "px-2 py-1 rounded text-xs font-semibold uppercase tracking-widest text-white"
            : "px-2 py-1 rounded text-xs font-semibold uppercase tracking-widest text-white/55 transition-colors hover:text-white"
          : isActive
            ? "px-2 py-1 rounded text-xs font-semibold uppercase tracking-widest text-fp-coral"
            : "px-2 py-1 rounded text-xs font-semibold uppercase tracking-widest text-fp-muted hover:text-fp-coral transition-colors";

        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            className={className}
            aria-current={isActive ? "true" : undefined}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}
