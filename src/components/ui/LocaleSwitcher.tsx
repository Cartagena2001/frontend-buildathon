"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-widest transition-colors ${
            loc === locale
              ? "text-fp-cyan"
              : "text-fp-muted hover:text-fp-cream"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
