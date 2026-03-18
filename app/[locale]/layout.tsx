import {NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {hasLocale} from "next-intl";
import {notFound} from "next/navigation";
import {routing} from "../../i18n/routing";
import Navbar from "../components/navbar";

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-8">
        {children}
      </main>
    </NextIntlClientProvider>
  );
}