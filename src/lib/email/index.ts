import { Resend } from "resend";
import { assertEmailConfigured, getEmailConfig } from "./config";

export interface SendEmailParams {
  to:      string;
  subject: string;
  html:    string;
}

let resend: Resend | null = null;

function getResend() {
  const { apiKey, isConfigured } = getEmailConfig();
  if (!isConfigured) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

/** Sends an email via Resend. */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const { from, isConfigured } = getEmailConfig();
  const client = getResend();

  if (!client) {
    const msg =
      "RESEND_API_KEY is not set in .env — email was NOT sent. " +
      "Add your key from https://resend.com/api-keys (file .env, not .env.example).";

    if (process.env.NODE_ENV === "development") {
      console.error("\n[email:ERROR]", msg);
      console.error("[email:ERROR] to:", to, "| from:", from, "| subject:", subject, "\n");
      throw new Error(msg);
    }
    throw new Error(msg);
  }

  console.info("[email:send]", { to, from, subject });

  const { data, error } = await client.emails.send({ from, to, subject, html });

  if (error) {
    console.error("[email:error]", JSON.stringify(error, null, 2));
    throw new Error(`Resend: ${error.message}`);
  }

  console.info("[email:sent]", { id: data?.id });
  return { ok: true as const, id: data?.id };
}

export { welcomeEmail } from "./templates/welcome";
export { passwordResetOtpEmail } from "./templates/password-reset";
export { getEmailConfig, assertEmailConfigured } from "./config";
