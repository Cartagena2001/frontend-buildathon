"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { completePasswordReset } from "@/lib/auth/password-reset-actions";

const initialState = { error: undefined };

export default function NewPasswordForm() {
  const t = useTranslations("auth.newPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, action, pending] = useActionState(completePasswordReset, initialState);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);

  const mismatch = touched && confirm.length > 0 && password !== confirm;

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-fp-muted text-sm">{t("sessionExpired")}</p>
        <Link
          href="/forgot-password"
          className="inline-flex px-6 py-3 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
        >
          {t("requestNewCode")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("passwordPlaceholder")}
          required
          className="fp-input fp-field w-full border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("confirmPasswordLabel")}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t("confirmPasswordPlaceholder")}
          required
          className={`fp-input fp-field w-full border rounded-xl px-4 py-3 text-sm font-sans transition-colors ${
            mismatch ? "border-fp-red" : "border-fp-border"
          }`}
        />
        {mismatch && (
          <p className="text-fp-red text-xs mt-1.5">{t("passwordMismatch")}</p>
        )}
      </div>

      {state.error && (
        <p className="text-fp-red text-xs px-1">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || mismatch}
        className="w-full bg-fp-red text-fp-on-accent font-semibold text-sm rounded-xl py-3.5 hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
