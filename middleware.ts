import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip Next.js internals, static files (with extension), and metadata icon routes
    "/((?!_next|_vercel|icon|apple-icon|favicon\\.ico|.*\\..*).*)",
  ],
};
