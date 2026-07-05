"use server";

import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db/retry";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { AuthError } from "next-auth";
import { sendWelcomeEmail } from "@/lib/auth/password-reset";
import { getAppBaseUrl } from "@/lib/auth/password-reset-actions";
import { findySignup } from "@/lib/findy-core/auth";

function safeCallbackUrl(raw: string, locale: string): string {
  const fallback = `/${locale}`;
  if (!raw.startsWith("/")) return fallback;
  if (!/^\/(en|es)(\/|$)/.test(raw)) return fallback;
  return raw;
}

// ── Register ──────────────────────────────────────────────

export interface RegisterState {
  error?: string;
  success?: boolean;
}

export async function registerUser(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName  = String(formData.get("lastName")  ?? "").trim();
  const email     = String(formData.get("email")     ?? "").trim().toLowerCase();
  const password  = String(formData.get("password")  ?? "");
  const confirm   = String(formData.get("confirm")   ?? "");

  if (!firstName || !lastName || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  // Check duplicate email
  let existing: { id: string } | undefined;
  try {
    [existing] = await withDbRetry(() =>
      db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1),
    );
  } catch (err) {
    console.error("[register:db]", err);
    return {
      error:
        "Could not connect to the database. Check your internet connection and try again.",
    };
  }

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Shared DB with findy-core: signup creates the user with PBKDF2 hash.
  // Do NOT insert here first — that caused 409 on findy signup and no JWT.
  let findyToken: string | null;
  try {
    findyToken = await findySignup({ firstName, lastName, email, password });
  } catch (err) {
    console.error("[register:findy-signup]", err);
    return {
      error: "Could not connect to the API. Check your internet connection and try again.",
    };
  }

  if (!findyToken) {
    return { error: "An account with this email already exists." };
  }

  // Welcome email (non-blocking for registration flow)
  try {
    const locale = (await getLocale()) as "en" | "es";
    const baseUrl = await getAppBaseUrl();
    await sendWelcomeEmail({ email, firstName }, locale, baseUrl);
  } catch (err) {
    console.error("[register:welcome-email]", err);
  }

  // Auto-login after register — pass findy-core JWT from signup into session
  await signIn("credentials", {
    email,
    password,
    findyCoreToken: findyToken,
    redirect: false,
  });

  const locale = await getLocale();
  redirect(`/${locale}`);
}

// ── Login ─────────────────────────────────────────────────

export interface LoginState {
  error?: string;
}

export async function loginUser(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email    = String(formData.get("email")    ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }

  const locale = await getLocale();
  const callbackUrl = safeCallbackUrl(
    String(formData.get("callbackUrl") ?? ""),
    locale,
  );
  redirect(callbackUrl);
}
