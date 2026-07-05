"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import GoogleIcon from "@/components/ui/GoogleIcon";

interface Props {
  label: string;
  className?: string;
}

function hasSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();
  return Boolean(url && key);
}

export default function GoogleSignInButton({ label, className = "" }: Props) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);

    if (!hasSupabaseEnv()) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const next = `/${locale}`;
      const redirectTo = `${window.location.origin}/auth/callback?locale=${locale}&next=${encodeURIComponent(next)}`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google sign-in.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 fp-btn-secondary rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-60 ${className}`}
      >
        <GoogleIcon />
        {loading ? "…" : label}
      </button>
      {error && (
        <p className="text-fp-coral text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
