import {getTranslations} from "next-intl/server";
import {Link} from "../../i18n/navigation";
import {
  Swords,
  Trophy,
  Upload,
  Flame,
  PlayCircle,
  Shield
} from "lucide-react";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Home"});

  return (
    <div className="space-y-6 text-white sm:space-y-8 md:space-y-10">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-zinc-900/80 px-4 py-10 backdrop-blur-xl sm:px-6 sm:py-12 md:rounded-[2rem] md:px-10 md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_28%)]" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs text-zinc-300 sm:px-4 sm:text-sm">
            <Flame size={15} />
            {t("eyebrow")}
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-6xl">
            {t("titleA")}{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {t("titleB")}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base md:mt-5 md:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              href="/battle"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] sm:w-auto"
            >
              <Swords size={18} />
              {t("battle")}
            </Link>

            <Link
              href="/upload"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
            >
              <Upload size={18} />
              {t("upload")}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <p className="text-xs text-zinc-400 sm:text-sm">{t("stat1Label")}</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">{t("stat1Value")}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <p className="text-xs text-zinc-400 sm:text-sm">{t("stat2Label")}</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">{t("stat2Value")}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <p className="text-xs text-zinc-400 sm:text-sm">{t("stat3Label")}</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">{t("stat3Value")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur-xl sm:p-6 md:rounded-[2rem]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400 sm:text-sm">{t("previewBadge")}</p>
              <h2 className="text-xl font-bold sm:text-2xl">{t("previewTitle")}</h2>
            </div>

            <div className="w-fit rounded-full border border-zinc-700 bg-zinc-800 px-3 py-2 text-[11px] text-zinc-300 sm:px-4 sm:text-xs">
              {t("previewLive")}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/20">
                <PlayCircle size={46} className="text-white/90 sm:size-[56px]" />
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-base font-bold sm:text-lg">{t("clipATitle")}</h3>
                <p className="text-sm text-zinc-400">{t("clipAGame")}</p>
                <p className="text-xs text-zinc-500">{t("clipAUser")}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20">
                <PlayCircle size={46} className="text-white/90 sm:size-[56px]" />
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-base font-bold sm:text-lg">{t("clipBTitle")}</h3>
                <p className="text-sm text-zinc-400">{t("clipBGame")}</p>
                <p className="text-xs text-zinc-500">{t("clipBUser")}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[58%] bg-gradient-to-r from-purple-500 to-blue-500" />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 sm:text-sm">
            <span>{t("previewLeft")}</span>
            <span>{t("previewRight")}</span>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur-xl sm:p-6 md:rounded-[2rem]">
          <p className="text-xs text-zinc-400 sm:text-sm">{t("whyBadge")}</p>
          <h2 className="text-xl font-bold sm:text-2xl">{t("whyTitle")}</h2>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-2 inline-flex rounded-xl bg-purple-500/15 p-2 text-purple-300">
                <Swords size={18} />
              </div>
              <h3 className="font-semibold">{t("why1Title")}</h3>
              <p className="mt-1 text-sm text-zinc-400">{t("why1Text")}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-2 inline-flex rounded-xl bg-blue-500/15 p-2 text-blue-300">
                <Trophy size={18} />
              </div>
              <h3 className="font-semibold">{t("why2Title")}</h3>
              <p className="mt-1 text-sm text-zinc-400">{t("why2Text")}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-2 inline-flex rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
                <Shield size={18} />
              </div>
              <h3 className="font-semibold">{t("why3Title")}</h3>
              <p className="mt-1 text-sm text-zinc-400">{t("why3Text")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur-xl sm:p-6 md:rounded-[2rem] md:p-8">
        <div className="mb-6">
          <p className="text-xs text-zinc-400 sm:text-sm">{t("featuresBadge")}</p>
          <h2 className="text-xl font-bold sm:text-2xl">{t("featuresTitle")}</h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-purple-500/15 p-3 text-purple-300">
              <Upload size={20} />
            </div>
            <h3 className="text-lg font-bold">{t("feature1Title")}</h3>
            <p className="mt-2 text-sm text-zinc-400">{t("feature1Text")}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-blue-500/15 p-3 text-blue-300">
              <Swords size={20} />
            </div>
            <h3 className="text-lg font-bold">{t("feature2Title")}</h3>
            <p className="mt-2 text-sm text-zinc-400">{t("feature2Text")}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-amber-500/15 p-3 text-amber-300">
              <Trophy size={20} />
            </div>
            <h3 className="text-lg font-bold">{t("feature3Title")}</h3>
            <p className="mt-2 text-sm text-zinc-400">{t("feature3Text")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}