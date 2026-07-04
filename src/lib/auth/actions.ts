"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { AuthError } from "next-auth";

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
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    firstName,
    lastName,
    email,
    passwordHash,
    authProvider: "credentials",
  });

  // Auto-login after register
  await signIn("credentials", { email, password, redirect: false });

  const locale = await getLocale();
  redirect(`/${locale}/explore`);
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
  redirect(`/${locale}/explore`);
}
