import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { getLocale } from "next-intl/server";
import { getTheme } from "@/lib/theme";
import { MASCOT_VERSION } from "@/components/mascot/types";
import "./globals.css";

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
  title: "findy.place — Tu guía de experiencias",
  description:
    "Descubre, explora y recomienda los lugares más virales de El Salvador, impulsados por datos de TikTok e Instagram.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${dmSerifDisplay.variable} ${dmSans.variable} h-full`}
    >
      <head>
        <link rel="preload" href="/mascot/hero-cat.webp" as="image" type="image/webp" />
        <link
          rel="preload"
          href={`/mascot/loading-search-poster.png?v=${MASCOT_VERSION}`}
          as="image"
        />
        <link
          rel="preload"
          href={`/mascot/loading-search.mp4?v=${MASCOT_VERSION}`}
          as="fetch"
          type="video/mp4"
        />
      </head>
      <body
        data-theme={theme}
        suppressHydrationWarning
        className="min-h-full bg-fp-dark text-fp-cream antialiased transition-colors duration-300"
      >
        {children}
      </body>
    </html>
  );
}
