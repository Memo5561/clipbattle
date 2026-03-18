import {getTranslations} from "next-intl/server";
import {Link} from "../../i18n/navigation";
import {Swords, Trophy, Upload, Flame, PlayCircle, Shield} from "lucide-react";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Home"});

  return (
    <div className="space-y-10 text-white">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/80 px-6 py-14 backdrop-blur-xl md:px-10 md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_28%)]" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm text-zinc-300">
            <Flame size={16} />
            {t("eyebrow")}
          </div>

          <h1 className="text-4xl font-black md:text-6xl">
            {t("titleA")}{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {t("titleB")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/battle"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold"
            >
              <Swords size={18} />
              {t("battle")}
            </Link>

            <Link
              href="/upload"
              className="flex items-center gap-2 rounded-2xl border border-zinc-700 px-6 py-3"
            >
              <Upload size={18} />
              {t("upload")}
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid gap-6 md:grid-cols-3">

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <Upload size={22} />
          <h3 className="mt-3 font-bold">{t("feature1Title")}</h3>
          <p className="text-zinc-400 text-sm">{t("feature1Text")}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <Swords size={22} />
          <h3 className="mt-3 font-bold">{t("feature2Title")}</h3>
          <p className="text-zinc-400 text-sm">{t("feature2Text")}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <Trophy size={22} />
          <h3 className="mt-3 font-bold">{t("feature3Title")}</h3>
          <p className="text-zinc-400 text-sm">{t("feature3Text")}</p>
        </div>

      </section>

      {/* PREVIEW */}
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-bold">{t("previewTitle")}</h2>

        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className="bg-black rounded-xl aspect-video flex items-center justify-center">
            <PlayCircle size={50} />
          </div>

          <div className="bg-black rounded-xl aspect-video flex items-center justify-center">
            <PlayCircle size={50} />
          </div>
        </div>
      </section>

    </div>
  );
}