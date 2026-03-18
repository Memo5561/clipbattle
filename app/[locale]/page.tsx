import {getTranslations} from "next-intl/server";
import {Link} from "../../i18n/navigation";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Home"});

  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          {t("title")}
        </h1>

        <p className="mt-4 text-zinc-400">
          {t("subtitle")}
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/battle"
            className="rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-600"
          >
            {t("battle")}
          </Link>

          <Link
            href="/upload"
            className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            {t("upload")}
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg font-bold">{t("feature1Title")}</h3>
          <p className="mt-2 text-sm text-zinc-400">{t("feature1Text")}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg font-bold">{t("feature2Title")}</h3>
          <p className="mt-2 text-sm text-zinc-400">{t("feature2Text")}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <h3 className="text-lg font-bold">{t("feature3Title")}</h3>
          <p className="mt-2 text-sm text-zinc-400">{t("feature3Text")}</p>
        </div>
      </section>
    </div>
  );
}