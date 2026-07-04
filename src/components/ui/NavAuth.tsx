/**
 * Server component — reads Auth.js session and renders:
 *   • "Sign in" button  → when not authenticated
 *   • Avatar dropdown   → when authenticated (name initial + menu)
 */
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NavUserMenu from "./NavUserMenu";

export default async function NavAuth() {
  const [session, t] = await Promise.all([
    auth(),
    getTranslations("nav"),
  ]);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
      >
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
