"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/auth/actions";

const initialState = { error: undefined };

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [state, action, pending] = useActionState(loginUser, initialState);

  return (
    <form action={action} className="space-y-4">
      {resetSuccess && (
        <p className="text-fp-cyan text-xs px-1 py-2 rounded-lg bg-fp-cyan/10 border border-fp-cyan/20">
          {t("resetSuccess")}
        </p>
      )}
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

      <div>
        <label htmlFor="password" className="block text-fp-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          required
          className="fp-input fp-field w-full border border-fp-border rounded-xl px-4 py-3 text-sm font-sans transition-colors"
        />
      </div>

      <div className="flex items-center justify-end">
        <Link href="/forgot-password" className="text-fp-muted hover:text-fp-cyan text-xs transition-colors">
          {t("forgotPassword")}
        </Link>
      </div>

      {state.error && (
        <p className="text-fp-red text-xs px-1">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-fp-red text-fp-on-accent font-semibold text-sm rounded-xl py-3.5 hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "…" : t("submitButton")}
      </button>
    </form>
  );
}
