import { EMAIL_FONT_SANS } from "@/lib/typography";

/** Brand tokens for HTML emails (inline CSS — email clients ignore CSS variables). */
export const EMAIL_BRAND = {
  bg:      "#040404",
  surface: "#0e0e0e",
  cream:   "#f0e8ec",
  muted:   "#de8c9d",
  red:     "#fe2858",
  cyan:    "#2af0ea",
  border:  "rgba(222,140,157,0.25)",
} as const;

export interface EmailLayoutOptions {
  previewText: string;
  bodyHtml:    string;
}

/** Shared dark-themed email shell matching findy.place. */
export function emailLayout({ previewText, bodyHtml }: EmailLayoutOptions): string {
  const { bg, surface, cream, muted, cyan, border } = EMAIL_BRAND;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>findy.place</title>
</head>
<body style="margin:0;padding:0;background-color:${bg};font-family:${EMAIL_FONT_SANS};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:${surface};border:1px solid ${border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid ${border};">
              <span style="font-size:22px;font-weight:300;letter-spacing:0.04em;color:${cream};">
                findy<span style="color:${cyan};">.</span>place
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:${cream};font-size:15px;line-height:1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid ${border};text-align:center;">
              <p style="margin:0;font-size:12px;color:${muted};">
                © ${new Date().getFullYear()} findy.place — Not the best rated. The most talked about.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto;">
    <tr>
      <td style="border-radius:999px;background-color:${EMAIL_BRAND.red};">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

export function emailOtpBox(code: string): string {
  return `<div style="margin:24px 0;padding:20px;text-align:center;background-color:${EMAIL_BRAND.bg};border:1px solid ${EMAIL_BRAND.border};border-radius:12px;">
    <span style="font-size:32px;font-weight:700;letter-spacing:0.35em;color:${EMAIL_BRAND.cyan};font-family:monospace;">
      ${code}
    </span>
  </div>`;
}
