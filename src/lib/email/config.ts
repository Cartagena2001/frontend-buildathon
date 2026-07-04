/** Normalize env values (quotes, whitespace). */
export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "") ?? "";
  const from =
    process.env.EMAIL_FROM?.trim().replace(/^["']|["']$/g, "") ||
    "findy.place <onboarding@resend.dev>";

  return {
    apiKey,
    from,
    isConfigured: apiKey.length > 0 && apiKey.startsWith("re_"),
  };
}

export function assertEmailConfigured() {
  const { apiKey, isConfigured } = getEmailConfig();

  if (!isConfigured) {
    throw new Error(
      "RESEND_API_KEY is missing or invalid in .env (must start with re_). " +
        "Create one at https://resend.com/api-keys"
    );
  }

  return apiKey;
}
