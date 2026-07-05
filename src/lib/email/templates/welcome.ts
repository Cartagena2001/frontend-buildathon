import { EMAIL_FONT_DISPLAY } from "@/lib/typography";
import { emailLayout, emailButton, EMAIL_BRAND } from "./base";

export interface WelcomeEmailContent {
  firstName: string;
  exploreUrl: string;
  locale:    "en" | "es";
}

const copy = {
  en: {
    subject:     "Welcome to findy.place",
    preview:     "Your account is ready — start exploring viral spots.",
    greeting:    (name: string) => `Hey ${name},`,
    lead:        "Welcome to findy.place — where we surface the most talked-about spots in El Salvador, not just the best rated.",
    body:        "Your account is ready. Search trending places, save your next adventures, and discover what's going viral right now.",
    cta:         "Start exploring",
    signOff:     "See you out there,",
    team:        "The findy.place team",
  },
  es: {
    subject:     "Bienvenido a findy.place",
    preview:     "Tu cuenta está lista — empieza a explorar lugares virales.",
    greeting:    (name: string) => `Hola ${name},`,
    lead:        "Bienvenido a findy.place — donde encontramos los lugares más comentados de El Salvador, no solo los mejor calificados.",
    body:        "Tu cuenta ya está activa. Busca lugares en tendencia, guarda tus próximas aventuras y descubre lo que está viral ahora mismo.",
    cta:         "Empezar a explorar",
    signOff:     "Nos vemos pronto,",
    team:        "El equipo de findy.place",
  },
} as const;

export function welcomeEmail({ firstName, exploreUrl, locale }: WelcomeEmailContent) {
  const t = copy[locale];

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:22px;font-style:italic;color:${EMAIL_BRAND.cream};font-family:${EMAIL_FONT_DISPLAY};">
      ${t.greeting(firstName)}
    </p>
    <p style="margin:0 0 16px;color:${EMAIL_BRAND.muted};">${t.lead}</p>
    <p style="margin:0 0 8px;color:${EMAIL_BRAND.cream};">${t.body}</p>
    ${emailButton(exploreUrl, t.cta)}
    <p style="margin:24px 0 4px;color:${EMAIL_BRAND.cream};">${t.signOff}</p>
    <p style="margin:0;color:${EMAIL_BRAND.muted};">${t.team}</p>
  `;

  return {
    subject: t.subject,
    html:    emailLayout({ previewText: t.preview, bodyHtml }),
  };
}
