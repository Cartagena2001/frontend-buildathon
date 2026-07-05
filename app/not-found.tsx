import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import NotFoundScreen from "@/components/mascot/NotFoundScreen";

export default async function NotFound() {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundScreen />
    </NextIntlClientProvider>
  );
}
