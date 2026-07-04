import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { savedPlaces } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import NavAuth from "@/components/ui/NavAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import SavedPlaceCard from "./SavedPlaceCard";

export default async function SavedPage() {
  const [session, t, locale] = await Promise.all([
    auth(),
    getTranslations("saved"),
    getLocale(),
  ]);

  if (!session?.user) redirect(`/${locale}/login`);

  const places = await db
    .select()
    .from(savedPlaces)
    .where(eq(savedPlaces.userId, session.user.id!))
    .orderBy(desc(savedPlaces.createdAt));

  return (
    <div className="min-h-screen" style={{ background: "var(--fp-dark)" }}>
      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-8 py-5 border-b border-fp-border">
        <Link href="/" className="text-fp-cream font-sans text-[1.05rem] font-light tracking-wide">
          findy<span className="text-fp-cyan">.</span>place
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LocaleSwitcher />
          <NavAuth />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-fp-cream mb-2">{t("title")}</h1>
          <p className="text-fp-muted text-sm">{t("subtitle")}</p>
        </div>

        {places.length === 0 ? (
          /* Empty state */
          <div className="glass rounded-2xl flex flex-col items-center justify-center gap-5 py-20 text-center px-6">
            <BookmarkLargeIcon />
            <div>
              <p className="text-fp-cream font-semibold text-lg mb-1">{t("empty")}</p>
              <p className="text-fp-muted text-sm max-w-xs">{t("emptySub")}</p>
            </div>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
            >
              {t("exploreNow")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {places.map((place) => (
              <SavedPlaceCard key={place.id} place={place} removeLabel={t("remove")} savedLabel={t("savedOn")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookmarkLargeIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-fp-border">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
