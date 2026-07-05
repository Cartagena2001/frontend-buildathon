/**
 * Server component — reads Auth.js session and renders:
 *   • "Sign in" button  → when not authenticated
 *   • Avatar dropdown   → when authenticated (name initial + menu)
 */
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NavUserMenu from "./NavUserMenu";

type NavAuthProps = {
  variant?: "default" | "hero";
};

export default async function NavAuth({ variant = "default" }: NavAuthProps) {
  const [session, t] = await Promise.all([
    auth(),
    getTranslations("nav"),
  ]);

  if (!session?.user) {
    const className =
      variant === "hero"
        ? "hero-nav-signin px-4 py-2 rounded-full border border-white/55 bg-transparent text-sm font-semibold text-white transition-colors hover:border-white/75 hover:bg-white/12"
        : "px-4 py-2 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors";

    return (
      <Link href="/login" className={className}>
        {t("signIn")}
      </Link>
    );
  }

  return (
    <NavUserMenu
      name={session.user.name ?? ""}
      email={session.user.email ?? ""}
    />
  );
}
