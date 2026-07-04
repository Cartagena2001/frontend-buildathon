/**
 * Send a test email (OTP template) to verify Resend configuration.
 *
 * Usage:
 *   npm run email:test -- tu@correo.com
 *   npm run email:test -- tu@correo.com es
 */
import { sendEmail, passwordResetOtpEmail, getEmailConfig } from "./index";

async function main() {
  const to = process.argv[2];
  const locale = (process.argv[3] === "es" ? "es" : "en") as "en" | "es";

  console.log("\n── findy.place · email test ──\n");

  const { apiKey, from, isConfigured } = getEmailConfig();

  console.log("RESEND_API_KEY:", apiKey ? `${apiKey.slice(0, 10)}… (${apiKey.length} chars)` : "❌ EMPTY");
  console.log("EMAIL_FROM:    ", from);
  console.log("Valid key:     ", isConfigured ? "✅ yes" : "❌ no (must start with re_)");

  if (!isConfigured) {
    console.error("\n❌ Fix your .env file (NOT .env.example):");
    console.error('   RESEND_API_KEY=re_xxxxxxxx');
    console.error('   EMAIL_FROM="findy.place <onboarding@resend.dev>"');
    console.error("\n   Restart `npm run dev` after saving .env\n");
    process.exit(1);
  }

  if (!to) {
    console.error("\n❌ Usage: npm run email:test -- your@email.com [en|es]");
    console.error("   ⚠️  Sandbox: send ONLY to the email of your Resend account\n");
    process.exit(1);
  }

  const testOtp = "482910";
  const { subject, html } = passwordResetOtpEmail({
    firstName: "Test",
    otp: testOtp,
    locale,
  });

  console.log(`\nSending to: ${to}`);
  console.log(`Test OTP: ${testOtp}\n`);

  try {
    const result = await sendEmail({ to, subject, html });
    console.log("✅ Sent! Resend id:", result.id);
    console.log("\nIf you don't see it:");
    console.log(" • Wait 1–2 min and check spam/junk");
    console.log(" • Sandbox only delivers to YOUR Resend account email");
    console.log(" • Logs: https://resend.com/emails\n");
  } catch (err) {
    console.error("❌", err instanceof Error ? err.message : err);
    console.error("\nCommon Resend errors:");
    console.error(" • 403 — recipient must match your Resend account email (sandbox)");
    console.error(" • 422 — invalid EMAIL_FROM (use quotes if it has < >)");
    console.error(" • 401 — invalid or revoked API key\n");
    process.exit(1);
  }
}

main();
