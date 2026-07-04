import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import GoogleIcon from "@/components/ui/GoogleIcon";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <div className="glass rounded-2xl w-full max-w-md p-6 sm:p-8 fade-up">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-fp-cream mb-1">{t("title")}</h2>
        <p className="text-fp-muted text-sm">{t("subtitle")}</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
            {t("emailLabel")}
          </label>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            className="fp-input w-full fp-field border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
          />
        </div>

        <div>
          <label className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
            {t("passwordLabel")}
          </label>
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            className="fp-input w-full fp-field border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link href="#" className="text-fp-muted hover:text-fp-cyan text-xs transition-colors">
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-fp-red text-fp-on-accent font-semibold text-sm rounded-xl py-3.5 hover:bg-fp-coral transition-colors mt-2"
        >
          {t("submitButton")}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-fp-border" />
        <span className="text-fp-muted text-xs uppercase tracking-widest">{t("orDivider")}</span>
        <div className="flex-1 h-px bg-fp-border" />
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 fp-btn-secondary rounded-xl py-3 text-sm font-medium transition-colors"
      >
        <GoogleIcon />
        {t("googleButton")}
      </button>

      <p className="text-center text-fp-muted text-sm mt-6">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-fp-cyan hover:underline">
          {t("createOne")}
        </Link>
      </p>
    </div>
  );
}
