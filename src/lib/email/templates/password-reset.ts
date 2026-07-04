import { emailLayout, emailOtpBox, EMAIL_BRAND } from "./base";

export interface PasswordResetEmailContent {
  firstName: string;
  otp:       string;
  locale:    "en" | "es";
}

const copy = {
  en: {
    subject:   "Your findy.place password reset code",
    preview:   "Use this code to reset your password. Valid for 1 hour.",
    greeting:  (name: string) => `Hi ${name},`,
    lead:      "We received a request to reset your password.",
    body:      "Enter this one-time code on the reset page. It expires in <strong style=\"color:#2af0ea;\">1 hour</strong>.",
    ignore:    "If you didn't request this, you can safely ignore this email.",
    expires:   "Code expires in 1 hour.",
  },
  es: {
    subject:   "Tu código para restablecer contraseña en findy.place",
    preview:   "Usa este código para restablecer tu contraseña. Válido por 1 hora.",
    greeting:  (name: string) => `Hola ${name},`,
    lead:      "Recibimos una solicitud para restablecer tu contraseña.",
    body:      "Ingresa este código de un solo uso en la página de restablecimiento. Expira en <strong style=\"color:#2af0ea;\">1 hora</strong>.",
    ignore:    "Si no solicitaste esto, puedes ignorar este correo.",
    expires:   "El código expira en 1 hora.",
  },
} as const;

export function passwordResetOtpEmail({ firstName, otp, locale }: PasswordResetEmailContent) {
  const t = copy[locale];

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:20px;font-style:italic;color:${EMAIL_BRAND.cream};font-family:Georgia,'Times New Roman',serif;">
      ${t.greeting(firstName)}
    </p>
    <p style="margin:0 0 12px;color:${EMAIL_BRAND.muted};">${t.lead}</p>
    <p style="margin:0 0 8px;color:${EMAIL_BRAND.cream};">${t.body}</p>
    ${emailOtpBox(otp)}
    <p style="margin:0 0 8px;font-size:12px;color:${EMAIL_BRAND.muted};text-align:center;">${t.expires}</p>
    <p style="margin:16px 0 0;font-size:13px;color:${EMAIL_BRAND.muted};">${t.ignore}</p>
  `;

  return {
    subject: t.subject,
    html:    emailLayout({ previewText: t.preview, bodyHtml }),
  };
}
