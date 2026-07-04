"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { verifyResetOtpCode } from "@/lib/auth/password-reset-actions";

const initialState = { error: undefined };

export default function VerifyOtpForm() {
  const t = useTranslations("auth.resetPassword");
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [state, action, pending] = useActionState(verifyResetOtpCode, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="email" value={emailFromQuery} />

      <div>
        <label htmlFor="otp" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("otpLabel")}
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={t("otpPlaceholder")}
          required
          className="fp-input fp-field w-full border border-fp-border rounded-xl px-4 py-3 text-sm font-sans tracking-[0.3em] text-center transition-colors"
        />
        <p className="text-fp-muted text-xs mt-1.5">{t("otpHint")}</p>
      </div>

      {state.error && (
        <p className="text-fp-red text-xs px-1">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-fp-red text-fp-on-accent font-semibold text-sm rounded-xl py-3.5 hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "…" : t("verifyButton")}
      </button>

      <p className="text-center text-fp-muted text-sm">
        <Link href="/forgot-password" className="text-fp-cyan hover:underline">
          {t("resendCode")}
        </Link>
        {" · "}
        <Link href="/login" className="text-fp-cyan hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
