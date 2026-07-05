"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import UserAvatar from "./UserAvatar";

interface Props {
  name:  string;
  email: string;
  image?: string | null;
}

export default function NavUserMenu({ name, email, image }: Props) {
  const t = useTranslations("nav");
  const [open, setOpen]         = useState(false);
  const [pos,  setPos]          = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Recalculate dropdown position relative to the viewport
  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top:   rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, []);

  const handleOpen = () => {
    updatePos();
    setOpen((o) => !o);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        menuRef.current  && !menuRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  const dropdown = open ? (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: pos.top,
        right: pos.right,
        zIndex: 9999,
        background: "color-mix(in srgb, var(--fp-dim) 98%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      className="w-56 rounded-xl border border-fp-border shadow-2xl overflow-hidden"
    >
      {/* User info header */}
      <div className="px-4 py-3 border-b border-fp-border">
        <p className="text-fp-cream text-sm font-semibold truncate">{name}</p>
        <p className="text-fp-muted text-xs truncate">{email}</p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-fp-cream hover:bg-fp-cyan/10 hover:text-fp-cyan transition-colors"
        >
          <ProfileIcon />
          {t("profile")}
        </Link>
        <Link
          href="/lists"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-fp-cream hover:bg-fp-cyan/10 hover:text-fp-cyan transition-colors"
        >
          <SavedIcon />
          {t("lists")}
        </Link>
      </div>

      <div className="border-t border-fp-border py-1">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-fp-red hover:bg-fp-red/10 transition-colors"
        >
          <SignOutIcon />
          {t("signOut")}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="rounded-full hover:ring-2 hover:ring-fp-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-fp-cyan transition-shadow"
        aria-label="User menu"
      >
        <UserAvatar name={name} image={image} size="sm" />
      </button>

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}

function ProfileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function SavedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
