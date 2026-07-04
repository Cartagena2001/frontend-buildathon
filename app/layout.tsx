import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { getLocale } from "next-intl/server";
import { getTheme } from "@/lib/theme";
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
  title: "findy.place — Not the best rated. The most talked about.",
  description:
    "Discover the most viral places in El Salvador, powered by TikTok and Instagram data.",
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
