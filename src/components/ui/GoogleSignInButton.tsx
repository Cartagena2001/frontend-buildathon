"use client";

import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import GoogleIcon from "@/components/ui/GoogleIcon";

interface Props {
  label: string;
  className?: string;
}

export default function GoogleSignInButton({ label, className = "" }: Props) {
  const locale = useLocale();

  const handleClick = () => {
    const callbackUrl = `${window.location.origin}/${locale}/explore`;
    signIn("google", { callbackUrl });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-3 fp-btn-secondary rounded-xl py-3 text-sm font-medium transition-colors ${className}`}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}
