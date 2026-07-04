import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LoginForm from "./LoginForm";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <div className="glass rounded-2xl w-full max-w-md p-6 sm:p-8 fade-up">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-fp-cream mb-1">{t("title")}</h2>
        <p className="text-fp-muted text-sm">{t("subtitle")}</p>
      </div>

      <Suspense fallback={<p className="text-fp-muted text-sm">…</p>}>
        <LoginForm />
      </Suspense>

      <GoogleAuthButton namespace="auth.login" />

      <p className="text-center text-fp-muted text-sm mt-6">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-fp-cyan hover:underline">
          {t("createOne")}
        </Link>
      </p>
    </div>
  );
}
