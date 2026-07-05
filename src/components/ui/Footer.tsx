import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import { APP_NAME } from "@/lib/brand";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-fp-dim border-t border-fp-border">
      <div className="w-full px-6 sm:px-8 py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex mb-4">
              <BrandLogo size="lg" />
            </Link>
            <p className="text-fp-muted text-sm leading-6 max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:justify-self-end">
            {/* Explore */}
            <div>
              <p className="text-fp-cream text-[0.65rem] font-bold uppercase tracking-[0.16em] mb-5">
                {t("exploreTitle")}
              </p>
              <ul className="space-y-3">
                {(["beaches", "dining", "hiddenGems", "nightlife"] as const).map((key) => (
                  <li key={key}>
                    <Link
                      href={`/explore?category=${key}`}
                      className="text-fp-muted text-sm hover:text-fp-coral transition-colors"
                    >
                      {t(`explore.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <p className="text-fp-cream text-[0.65rem] font-bold uppercase tracking-[0.16em] mb-5">
                {t("platformTitle")}
              </p>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-fp-muted text-sm hover:text-fp-coral transition-colors">
                    {t("platform.ourData")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-fp-muted text-sm hover:text-fp-coral transition-colors">
                    {t("platform.apiAccess")}
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="text-fp-muted text-sm hover:text-fp-coral transition-colors">
                    {t("platform.privacy")}
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="text-fp-muted text-sm hover:text-fp-coral transition-colors">
                    {t("platform.terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-fp-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-fp-muted text-xs">
            © {new Date().getFullYear()} {APP_NAME} · {t("rights")}
          </p>
          <div className="flex items-center gap-5">
            <SocialIcon href="#" label="TikTok">
              <TikTokIcon />
            </SocialIcon>
            <SocialIcon href="#" label="Instagram">
              <InstagramIcon />
            </SocialIcon>
            <SocialIcon href="#" label="X / Twitter">
              <XIcon />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 rounded-full border border-fp-border flex items-center justify-center text-fp-muted hover:text-fp-coral hover:border-fp-coral transition-colors"
    >
      {children}
    </a>
  );
}

function TikTokIcon() {
  return (
    <svg width="13" height="14" viewBox="0 0 24 28" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
