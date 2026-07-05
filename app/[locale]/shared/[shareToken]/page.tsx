import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { navLogoLinkClassName } from "@/components/ui/NavBarCluster";
import NavAuth from "@/components/ui/NavAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { getSharedPlaceList } from "@/features/place-lists/actions";

type Props = {
  params: Promise<{ shareToken: string }>;
};

export default async function SharedListPage({ params }: Props) {
  const { shareToken } = await params;
  const [list, t] = await Promise.all([
    getSharedPlaceList(shareToken),
    getTranslations("lists"),
  ]);

  if (!list) notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--fp-dark)" }}>
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

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        <p className="text-fp-cyan text-xs font-semibold uppercase tracking-widest mb-2">
          {t("sharedList")}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-fp-cream mb-2">
          {list.name}
        </h1>
        {list.description && (
          <p className="text-fp-muted text-sm max-w-2xl mb-2">{list.description}</p>
        )}
        <p className="text-fp-muted text-xs mb-8">
          {t("sharedBy", { name: list.owner.firstName })}
        </p>

        {list.places.length === 0 ? (
          <div className="glass rounded-2xl py-16 text-center px-6">
            <p className="text-fp-muted text-sm">{t("emptyShared")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {list.places.map((place) => (
              <Link
                key={place.id}
                href={`/explore/${place.id}`}
                className="glass rounded-2xl p-4 hover:border-fp-cyan/40 transition-colors group"
              >
                {place.category && (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-fp-cyan border border-fp-cyan/30 rounded-full px-2 py-0.5">
                    {place.category}
                  </span>
                )}
                <h2 className="font-display text-fp-cream text-lg mt-2 group-hover:text-fp-cyan transition-colors">
                  {place.canonicalName}
                </h2>
                {place.location.text && (
                  <p className="text-fp-muted text-xs mt-1">{place.location.text}</p>
                )}
                <span className="inline-block mt-3 text-fp-cyan text-xs font-semibold">
                  {t("viewPlace")} →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
