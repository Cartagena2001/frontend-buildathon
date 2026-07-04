import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, passwordResetOtps } from "@/lib/db/schema";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import {
  sendEmail,
  passwordResetOtpEmail,
  welcomeEmail,
} from "@/lib/email";

const OTP_TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export async function createPasswordResetOtp(userId: string): Promise<string> {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Invalidate previous unused OTPs for this user
  await db
    .update(passwordResetOtps)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetOtps.userId, userId),
        isNull(passwordResetOtps.usedAt)
      )
    );

  await db.insert(passwordResetOtps).values({ userId, otpHash, expiresAt });

  return otp;
}

export async function verifyPasswordResetOtp(
  userId: string,
  otp: string
): Promise<string | null> {
  const [record] = await db
    .select()
    .from(passwordResetOtps)
    .where(
      and(
        eq(passwordResetOtps.userId, userId),
        isNull(passwordResetOtps.usedAt),
        gt(passwordResetOtps.expiresAt, new Date())
      )
    )
    .orderBy(desc(passwordResetOtps.createdAt))
    .limit(1);

  if (!record) return null;

  const valid = await bcrypt.compare(otp, record.otpHash);
  return valid ? record.id : null;
}

export async function isOtpRecordValid(userId: string, otpId: string) {
  const [record] = await db
    .select({ id: passwordResetOtps.id })
    .from(passwordResetOtps)
    .where(
      and(
        eq(passwordResetOtps.id, otpId),
        eq(passwordResetOtps.userId, userId),
        isNull(passwordResetOtps.usedAt),
        gt(passwordResetOtps.expiresAt, new Date())
      )
    )
    .limit(1);

  return Boolean(record);
}

export async function markOtpUsedById(otpId: string) {
  await db
    .update(passwordResetOtps)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetOtps.id, otpId));
}

export async function sendPasswordResetEmail(
  user: { id: string; email: string; firstName: string },
  locale: "en" | "es"
) {
  const otp = await createPasswordResetOtp(user.id);
  const { subject, html } = passwordResetOtpEmail({
    firstName: user.firstName,
    otp,
    locale,
  });

  await sendEmail({ to: user.email, subject, html });
  return otp;
}

export async function sendWelcomeEmail(
  user: { email: string; firstName: string },
  locale: "en" | "es",
  baseUrl: string
) {
  const exploreUrl = `${baseUrl}/${locale}/explore`;
  const { subject, html } = welcomeEmail({
    firstName: user.firstName,
    exploreUrl,
    locale,
  });

  await sendEmail({ to: user.email, subject, html });
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return user ?? null;
}

export async function updateUserPassword(userId: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export { OTP_TTL_MS };
