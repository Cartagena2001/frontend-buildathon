"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset } from "@/lib/auth/password-reset-actions";

const initialState = { error: undefined, success: false };

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          required
          className="fp-input fp-field w-full border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
        />
      </div>

      {state.error && (
        <p className="text-fp-red text-xs px-1">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-fp-red text-fp-on-accent font-semibold text-sm rounded-xl py-3.5 hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "…" : t("submitButton")}
      </button>

      <p className="text-center text-fp-muted text-sm">
        <Link href="/login" className="text-fp-cyan hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
