import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import RegisterForm from "./RegisterForm";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";

export default function RegisterPage() {
  const t = useTranslations("auth.register");

  return (
    <div className="glass rounded-2xl w-full max-w-md p-6 sm:p-8 fade-up">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-fp-cream mb-1">{t("title")}</h2>
        <p className="text-fp-muted text-sm">{t("subtitle")}</p>
      </div>

      <RegisterForm />

      <GoogleAuthButton namespace="auth.register" />

      <p className="text-center text-fp-muted text-sm mt-6">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-fp-cyan hover:underline">{t("signIn")}</Link>
      </p>
    </div>
  );
}
