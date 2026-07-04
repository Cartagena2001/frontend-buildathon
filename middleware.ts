import { auth } from "@/lib/auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED = ["/explore", "/profile", "/saved"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    /\.(.+)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeStripped = pathname.replace(/^\/(en|es)/, "");
  const isProtected = PROTECTED.some((p) => localeStripped.startsWith(p));

  if (isProtected) {
    const session = await auth();
    if (!session) {
      const locale = pathname.startsWith("/en") ? "en" : "es";
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|icon|apple-icon|favicon\\.ico|.*\\..*).*)",
  ],
};
