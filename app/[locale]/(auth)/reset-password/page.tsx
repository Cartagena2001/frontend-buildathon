import { Suspense } from "react";
import { useTranslations } from "next-intl";
import VerifyOtpForm from "./VerifyOtpForm";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");

  return (
    <div className="glass rounded-2xl w-full max-w-md p-6 sm:p-8 fade-up">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-fp-cream mb-1">{t("title")}</h2>
        <p className="text-fp-muted text-sm">{t("subtitle")}</p>
      </div>
      <Suspense fallback={<p className="text-fp-muted text-sm">…</p>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
