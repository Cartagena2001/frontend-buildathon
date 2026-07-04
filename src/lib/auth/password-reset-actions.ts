"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import {
  findUserByEmail,
  sendPasswordResetEmail,
  verifyPasswordResetOtp,
  isOtpRecordValid,
  markOtpUsedById,
  updateUserPassword,
} from "./password-reset";
import { createPasswordResetToken, parsePasswordResetToken } from "./reset-token";

// ── Request OTP ───────────────────────────────────────────

export interface RequestResetState {
  error?:   string;
  success?: boolean;
  email?:   string;
}

export async function requestPasswordReset(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = (await getLocale()) as "en" | "es";

  if (!email) {
    return { error: locale === "es" ? "El correo es obligatorio." : "Email is required." };
  }

  const user = await findUserByEmail(email);

  if (user?.passwordHash) {
    try {
      await sendPasswordResetEmail(
        { id: user.id, email: user.email, firstName: user.firstName },
        locale
      );
    } catch (err) {
      console.error("[password-reset:send]", err);
      return {
        error:
          locale === "es"
            ? "No pudimos enviar el correo. Intenta de nuevo."
            : "Could not send the email. Please try again.",
      };
    }
  }

  redirect(`/${locale}/reset-password?email=${encodeURIComponent(email)}`);
}

// ── Step 1: Verify OTP ────────────────────────────────────

export interface VerifyOtpState {
  error?: string;
}

export async function verifyResetOtpCode(
  _prev: VerifyOtpState,
  formData: FormData
): Promise<VerifyOtpState> {
  const locale = (await getLocale()) as "en" | "es";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp   = String(formData.get("otp")   ?? "").trim();

  if (!email || !otp) {
    return {
      error: locale === "es" ? "El correo y el código son obligatorios." : "Email and code are required.",
    };
  }

  const user = await findUserByEmail(email);

  if (!user?.passwordHash) {
    return {
      error: locale === "es" ? "Código inválido o expirado." : "Invalid or expired code.",
    };
  }

  const otpId = await verifyPasswordResetOtp(user.id, otp);

  if (!otpId) {
    return {
      error: locale === "es" ? "Código inválido o expirado." : "Invalid or expired code.",
    };
  }

  const token = createPasswordResetToken(user.id, otpId);
  redirect(`/${locale}/reset-password/new-password?token=${encodeURIComponent(token)}`);
}

// ── Step 2: Set new password ──────────────────────────────

export interface NewPasswordState {
  error?: string;
}

export async function completePasswordReset(
  _prev: NewPasswordState,
  formData: FormData
): Promise<NewPasswordState> {
  const locale = (await getLocale()) as "en" | "es";
  const token    = String(formData.get("token")    ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm  = String(formData.get("confirm")  ?? "");

  const parsed = parsePasswordResetToken(token);

  if (!parsed) {
    return {
      error:
        locale === "es"
          ? "La sesión expiró. Solicita un nuevo código."
          : "Session expired. Please request a new code.",
    };
  }

  if (!password || !confirm) {
    return {
      error: locale === "es" ? "Todos los campos son obligatorios." : "All fields are required.",
    };
  }

  if (password.length < 8) {
    return {
      error:
        locale === "es"
          ? "La contraseña debe tener al menos 8 caracteres."
          : "Password must be at least 8 characters.",
    };
  }

  if (password !== confirm) {
    return {
      error: locale === "es" ? "Las contraseñas no coinciden." : "Passwords do not match.",
    };
  }

  const stillValid = await isOtpRecordValid(parsed.userId, parsed.otpId);

  if (!stillValid) {
    return {
      error:
        locale === "es"
          ? "La sesión expiró. Solicita un nuevo código."
          : "Session expired. Please request a new code.",
    };
  }

  await updateUserPassword(parsed.userId, password);
  await markOtpUsedById(parsed.otpId);

  redirect(`/${locale}/login?reset=success`);
}

/** Base URL for links in transactional emails. */
export async function getAppBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
