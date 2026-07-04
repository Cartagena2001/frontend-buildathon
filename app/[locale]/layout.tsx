import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import ThemeProvider from "@/components/ui/ThemeProvider";
import SearchLoadingRoot from "@/features/search/components/SearchLoadingRoot";
import { getTheme } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  const [messages, theme] = await Promise.all([getMessages(), getTheme()]);

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider initialTheme={theme}>
        <SearchLoadingRoot>{children}</SearchLoadingRoot>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
