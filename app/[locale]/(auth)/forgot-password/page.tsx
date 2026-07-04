import { useTranslations } from "next-intl";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");

  return (
    <div className="glass rounded-2xl w-full max-w-md p-6 sm:p-8 fade-up">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-fp-cream mb-1">{t("title")}</h2>
        <p className="text-fp-muted text-sm">{t("subtitle")}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
