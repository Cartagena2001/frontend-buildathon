"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import GoogleIcon from "@/components/ui/GoogleIcon";

export default function RegisterPage() {
  const t = useTranslations("auth.register");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);

  const mismatch = touched && confirm.length > 0 && password !== confirm;
  const match = touched && confirm.length > 0 && password === confirm;

  return (
    <div className="glass rounded-2xl w-full max-w-md p-6 sm:p-8 fade-up">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-fp-cream mb-1">{t("title")}</h2>
        <p className="text-fp-muted text-sm">{t("subtitle")}</p>
      </div>

      <form className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("firstNameLabel")}
            </label>
            <input
              type="text"
              placeholder={t("firstNamePlaceholder")}
              className="fp-input w-full bg-white/5 border border-fp-border rounded-xl px-4 py-3 text-fp-cream placeholder:text-fp-muted text-sm font-sans transition-colors"
            />
          </div>
          <div>
            <label className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("lastNameLabel")}
            </label>
            <input
              type="text"
              placeholder={t("lastNamePlaceholder")}
              className="fp-input w-full bg-white/5 border border-fp-border rounded-xl px-4 py-3 text-fp-cream placeholder:text-fp-muted text-sm font-sans transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
            {t("emailLabel")}
          </label>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            className="fp-input w-full bg-white/5 border border-fp-border rounded-xl px-4 py-3 text-fp-cream placeholder:text-fp-muted text-sm font-sans transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
            {t("passwordLabel")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="fp-input w-full bg-white/5 border border-fp-border rounded-xl px-4 py-3 text-fp-cream placeholder:text-fp-muted text-sm font-sans transition-colors"
          />
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
            {t("confirmPasswordLabel")}
          </label>
          <div className="relative">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={t("confirmPasswordPlaceholder")}
              className={`fp-input fp-field w-full border rounded-xl px-4 py-3 pr-10 text-sm font-sans transition-colors ${
                mismatch
                  ? "border-fp-red"
                  : match
                  ? "border-fp-cyan"
                  : "border-fp-border"
              }`}
            />
            {match && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fp-cyan text-base">
                ✓
              </span>
            )}
            {mismatch && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fp-red text-base">
                ✕
              </span>
            )}
          </div>
          {mismatch && (
            <p className="text-fp-red text-xs mt-1.5">{t("passwordMismatch")}</p>
          )}
        </div>

        {/* Terms */}
        <p className="text-fp-muted text-xs leading-relaxed">
          {t("termsText")}{" "}
          <Link href="/legal/terms" className="text-fp-cyan hover:underline">
            {t("termsLink")}
          </Link>{" "}
          {t("andText")}{" "}
          <Link href="/legal/privacy" className="text-fp-cyan hover:underline">
            {t("privacyLink")}
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={mismatch || (touched && confirm.length === 0 && password.length > 0)}
          className="w-full bg-fp-red text-fp-on-accent font-semibold text-sm rounded-xl py-3.5 hover:bg-fp-coral transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
        className="w-full flex items-center justify-center gap-3 bg-white/5 border border-fp-border rounded-xl py-3 text-fp-cream text-sm font-medium hover:bg-white/10 transition-colors"
      >
        <GoogleIcon />
        {t("googleButton")}
      </button>

      <p className="text-center text-fp-muted text-sm mt-6">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-fp-cyan hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
