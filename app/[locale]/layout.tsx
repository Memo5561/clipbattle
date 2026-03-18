import "../globals.css";
import {NextIntlClientProvider} from "next-intl";
import {getMessages} from "next-intl/server";
import Navbar from "../components/navbar";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={params.locale}>
      <body className="bg-black text-white">
        <NextIntlClientProvider messages={messages}>
          
          {/* NAVBAR */}
          <Navbar />

          {/* MAIN CONTENT */}
          <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-8">
            {children}
          </main>

        </NextIntlClientProvider>
      </body>
    </html>
  );
}