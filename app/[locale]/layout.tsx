import {NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {hasLocale} from "next-intl";
import {createClient} from "@supabase/supabase-js";
import {routing} from "../../i18n/routing";
import Navbar from "../components/navbar";
import AuthGuard from "../components/auth-guard";

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: {user}
  } = await supabase.auth.getUser();

  const publicPaths = ["/", "/auth"];
  const pathname =
    typeof children === "object" && children !== null ? "" : "";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </NextIntlClientProvider>
  );
}