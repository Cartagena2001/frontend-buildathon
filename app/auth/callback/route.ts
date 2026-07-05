import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertGoogleUser } from "@/lib/auth/google-user";
import { createOAuthBridgeToken } from "@/lib/auth/oauth-bridge-token";
import { provisionFindyCoreToken } from "@/lib/findy-core/auth";
import { signIn } from "@/lib/auth";

function loginError(origin: string, locale: string) {
  return NextResponse.redirect(
    new URL(`/${locale}/login?error=oauth`, origin),
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") ?? "en";
  const next = searchParams.get("next") ?? `/${locale}`;

  if (!code) {
    return loginError(origin, locale);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return loginError(origin, locale);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return loginError(origin, locale);
  }

  const metadata = user.user_metadata ?? {};
  const joinedName = [metadata.given_name, metadata.family_name]
    .filter(Boolean)
    .join(" ");

  const dbUser = await upsertGoogleUser({
    email: user.email,
    name:
      metadata.full_name ??
      metadata.name ??
      (joinedName || null),
    image: metadata.avatar_url ?? metadata.picture ?? null,
    supabaseUserId: user.id,
  });

  await supabase.auth.signOut();

  const bridgeToken = createOAuthBridgeToken(dbUser.id);

  const findyCoreToken = await provisionFindyCoreToken({
    id:        dbUser.id,
    email:     dbUser.email,
    firstName: dbUser.firstName,
    lastName:  dbUser.lastName,
  });

  if (!findyCoreToken) {
    console.error("[auth/callback] findy-core token provisioning failed for", dbUser.id);
  }

  await signIn("credentials", {
    oauthBridge: bridgeToken,
    ...(findyCoreToken ? { findyCoreToken } : {}),
    redirectTo: next,
  });
}
