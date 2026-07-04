import { getTranslations } from "next-intl/server";
import GoogleSignInButton from "./GoogleSignInButton";
import { isGoogleAuthEnabled } from "@/lib/auth/config";

interface Props {
  namespace: "auth.login" | "auth.register";
}

/** Divider + Google button. Hidden until GOOGLE_AUTH_ENABLED is true. */
export default async function GoogleAuthButton({ namespace }: Props) {
  if (!isGoogleAuthEnabled()) return null;

  const t = await getTranslations(namespace);

  return (
    <>
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-fp-border" />
        <span className="text-fp-muted text-xs uppercase tracking-widest">{t("orDivider")}</span>
        <div className="flex-1 h-px bg-fp-border" />
      </div>

      <GoogleSignInButton label={t("googleButton")} />
    </>
  );
}
