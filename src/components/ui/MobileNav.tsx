"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import { signOut } from "next-auth/react";

interface Props {
  user?: { name: string; email: string } | null;
}

export default function MobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  const initial = user?.name
    ? user.name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("")
    : null;

  const overlay = open ? (
    /* Full-screen drawer rendered in document.body so nothing clips it */
    <div
      className="md:hidden"
      style={{ position: "fixed", inset: 0, zIndex: 10000 }}
    >
      {/* Solid backdrop — click to close */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--fp-dark)",
          opacity: 0.97,
        }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer content */}
      <div
        style={{ position: "relative", zIndex: 1 }}
        className="flex flex-col h-full px-8 py-10"
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="self-end text-fp-muted hover:text-fp-cream mb-12 text-2xl leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>

        {/* Nav links */}
        <nav className="flex flex-col gap-8">
          {user && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="font-display text-fp-cream text-3xl italic hover:text-fp-rose transition-colors"
            >
              {t("profile")}
            </Link>
          )}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto flex flex-col gap-4">
          <LocaleSwitcher />

          {user ? (
            <div className="flex flex-col gap-3">
              {/* User info row */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-full bg-fp-red text-fp-on-accent text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-fp-cream text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-fp-muted text-xs truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex justify-center px-6 py-3 rounded-full border border-fp-border text-fp-red font-semibold hover:bg-fp-red/10 transition-colors"
              >
                {t("signOut")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="inline-flex justify-center px-6 py-3 rounded-full bg-fp-red text-fp-on-accent font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col gap-1.5 p-1"
        aria-label="Open menu"
      >
        <span className="w-5 h-px bg-fp-cream block" />
        <span className="w-5 h-px bg-fp-cream block" />
        <span className="w-3 h-px bg-fp-cream block" />
      </button>

      {typeof document !== "undefined" && createPortal(overlay, document.body)}
    </>
  );
}
