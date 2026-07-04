"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col gap-1.5 p-1"
        aria-label="Open menu"
      >
        <span className="w-5 h-px bg-fp-cream block" />
        <span className="w-5 h-px bg-fp-cream block" />
        <span className="w-3 h-px bg-fp-cream block" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col md:hidden">
          <div className="absolute inset-0 backdrop-blur-md" style={{ background: "var(--fp-dark)" }} onClick={() => setOpen(false)} />
          <div className="relative flex flex-col h-full px-8 py-10 z-10">
            <button
              onClick={() => setOpen(false)}
              className="self-end text-fp-muted hover:text-fp-cream mb-12 text-2xl"
            >
              ✕
            </button>
            <nav className="flex flex-col gap-8">
              <Link
                href="/explore"
                onClick={() => setOpen(false)}
                className="font-display text-fp-cream text-3xl italic hover:text-fp-rose transition-colors"
              >
                {t("destinations")}
              </Link>
              <Link
                href="/explore?sort=trending"
                onClick={() => setOpen(false)}
                className="font-display text-fp-cream text-3xl italic hover:text-fp-rose transition-colors"
              >
                {t("trending")}
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              <LocaleSwitcher />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex justify-center px-6 py-3 rounded-full bg-fp-red text-fp-on-accent font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
              >
                {t("signIn")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
