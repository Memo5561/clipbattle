"use client";

import {useEffect, useState} from "react";
import {supabase} from "../../lib/supabase";
import {useTranslations} from "next-intl";
import {Link} from "../../i18n/navigation";

export default function ProtectedPage({
  children
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("AuthGuard");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user);
      setLoading(false);
    };

    checkUser();

    const {
      data: {subscription}
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center backdrop-blur-xl">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center backdrop-blur-xl">
        <p className="mb-3 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1 text-xs text-zinc-400">
          🔒 {t("badge")}
        </p>

        <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>

        <p className="mt-3 text-zinc-400">{t("subtitle")}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
          >
            {t("login")}
          </Link>

          <Link
            href="/auth"
            className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            {t("register")}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}