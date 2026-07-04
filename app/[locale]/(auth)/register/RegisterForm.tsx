"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerUser } from "@/lib/auth/actions";

const initialState = { error: undefined, success: false };

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const [state, action, pending] = useActionState(registerUser, initialState);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);

  const mismatch = touched && confirm.length > 0 && password !== confirm;
  const match    = touched && confirm.length > 0 && password === confirm;

  return (
    <form action={action} className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
            {t("firstNameLabel")}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder={t("firstNamePlaceholder")}
            required
            className="fp-input fp-field w-full border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
            {t("lastNameLabel")}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder={t("lastNamePlaceholder")}
            required
            className="fp-input fp-field w-full border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("emailLabel")}
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          required
          className="fp-input fp-field w-full border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="reg-password" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("passwordLabel")}
        </label>
        <input
          id="reg-password"
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

      {/* Confirm password */}
      <div>
        <label htmlFor="reg-confirm" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <input
            id="reg-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={t("confirmPasswordPlaceholder")}
            required
            className={`fp-input fp-field w-full border rounded-xl px-4 py-3 pr-10 text-sm font-sans transition-colors ${
              mismatch ? "border-fp-red" : match ? "border-fp-cyan" : "border-fp-border"
            }`}
          />
          {match    && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fp-cyan">✓</span>}
          {mismatch && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fp-red">✕</span>}
        </div>
        {mismatch && (
          <p className="text-fp-red text-xs mt-1.5">{t("passwordMismatch")}</p>
        )}
      </div>

      {/* Terms */}
      <p className="text-fp-muted text-xs leading-relaxed">
        {t("termsText")}{" "}
        <Link href="/legal/terms" className="text-fp-cyan hover:underline">{t("termsLink")}</Link>{" "}
        {t("andText")}{" "}
        <Link href="/legal/privacy" className="text-fp-cyan hover:underline">{t("privacyLink")}</Link>.
      </p>

      {/* Server error */}
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
    </form>
  );
}
