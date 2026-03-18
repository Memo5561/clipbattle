"use client";

import {Link} from "../../i18n/navigation";
import {useTranslations} from "next-intl";

export default function AuthGuard() {
  const t = useTranslations("AuthGuard");

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