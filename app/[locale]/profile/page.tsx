import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NavAuth from "@/components/ui/NavAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import EditProfileButton from "@/components/profile/EditProfileButton";
import UserAvatar from "@/components/ui/UserAvatar";
import { getMyReviews } from "@/features/reviews/actions";
import MyReviewsList from "@/features/reviews/components/MyReviewsList";

export default async function ProfilePage() {
  const [session, t, locale] = await Promise.all([
    auth(),
    getTranslations("profile"),
    getLocale(),
  ]);

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Load full user record for createdAt date
  const [user, myReviews] = await Promise.all([
    db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id!))
      .limit(1)
      .then((rows) => rows[0]),
    getMyReviews(),
  ]);

  const firstName  = user?.firstName ?? session.user.name?.split(" ")[0] ?? "";
  const lastName   = user?.lastName ?? session.user.name?.split(" ").slice(1).join(" ") ?? "";
  const name       = `${firstName} ${lastName}`.trim() || session.user.name || "";
  const email      = session.user.email ?? "";
  const avatar     = user?.image ?? null;
  const createdAt  = user?.createdAt ? new Date(user.createdAt) : null;
  const reviewCount = myReviews.length;

  const tNav = await getTranslations("nav");

  return (
    <div className="min-h-screen" style={{ background: "var(--fp-dark)" }}>
      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-8 py-5 border-b border-fp-border">
        <Link href="/" className={navLogoLinkClassName}>
          <BrandLogo size="nav" />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LocaleSwitcher />
          <NavAuth />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        {/* Profile header card */}
        <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <UserAvatar name={name} image={avatar} size="md" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl sm:text-4xl text-fp-cream mb-1">
                {name}
              </h1>
              <p className="text-fp-muted text-sm mb-2">{email}</p>
              {createdAt && (
                <p className="text-fp-muted text-xs">
                  {t("memberSince")}{" "}
                  <span className="text-fp-cream">
                    {createdAt.toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </p>
              )}
            </div>

            {/* Edit button */}
            <EditProfileButton
              firstName={firstName}
              lastName={lastName}
              email={email}
              image={avatar}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: t("savedPlaces"), value: "0" },
            { label: t("reviews"),     value: String(reviewCount) },
            { label: tNav("destinations"), value: "—" },
          ].map(({ label, value }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <p className="text-fp-cream text-2xl font-bold mb-1">{value}</p>
              <p className="text-fp-muted text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Saved places section */}
        <section className="mb-8">
          <h2 className="font-display text-xl text-fp-cream mb-4">{t("savedPlaces")}</h2>
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <BookmarkEmptyIcon />
            <p className="text-fp-muted text-sm max-w-xs">{t("noSaved")}</p>
            <Link
              href="/explore"
              className="px-5 py-2.5 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
            >
              {t("exploreNow")}
            </Link>
          </div>
        </section>

        {/* Reviews section */}
        <section>
          <h2 className="font-display text-xl text-fp-cream mb-4">{t("reviews")}</h2>
          {myReviews.length === 0 ? (
            <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
              <ReviewEmptyIcon />
              <p className="text-fp-muted text-sm max-w-xs">{t("noReviews")}</p>
            </div>
          ) : (
            <MyReviewsList reviews={myReviews} />
          )}
        </section>
      </div>
    </div>
  );
}

function BookmarkEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fp-border">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function ReviewEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fp-border">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
