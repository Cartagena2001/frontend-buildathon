import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import ThemeProvider from "@/components/ui/ThemeProvider";
import "../globals.css";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "findy.place — Not the best rated. The most talked about.",
  description:
    "Discover the most viral places in El Salvador, powered by TikTok and Instagram data.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Inline script that runs before React hydration to avoid theme flash (FOUC)
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('fp-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${dmSerifDisplay.variable} ${dmSans.variable} h-full`}
    >
      <head>
        {/* Anti-FOUC: set data-theme before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-fp-dark text-fp-cream antialiased transition-colors duration-300">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
