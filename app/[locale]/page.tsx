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
      <section className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-zinc-900/75 px-4 py-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-6 sm:py-12 md:rounded-[2.2rem] md:px-10 md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.30),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.22),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_30%)]" />
        <div className="absolute -left-20 top-8 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-zinc-200 shadow-lg backdrop-blur-xl sm:px-4 sm:text-sm">
            <Flame size={15} />
            {t("eyebrow")}
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-6xl">
            <span className="text-white">{t("titleA")} </span>
            <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(139,92,246,0.25)]">
              {t("titleB")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-zinc-300/85 sm:text-base md:mt-6 md:text-lg md:leading-8">
            {t("subtitle")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              href="/battle"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-[0_12px_35px_rgba(99,102,241,0.35)] transition hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(99,102,241,0.42)] sm:w-auto"
            >
              <Swords size={18} />
              {t("battle")}
            </Link>

            <Link
              href="/upload"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white/10 sm:w-auto"
            >
              <Upload size={18} />
              {t("upload")}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-lg backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
                {t("stat1Label")}
              </p>
              <p className="mt-2 text-xl font-black sm:text-2xl">
                {t("stat1Value")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-lg backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
                {t("stat2Label")}
              </p>
              <p className="mt-2 text-xl font-black sm:text-2xl">
                {t("stat2Value")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-lg backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
                {t("stat3Label")}
              </p>
              <p className="mt-2 text-xl font-black sm:text-2xl">
                {t("stat3Value")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-zinc-900/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6 md:rounded-[2rem]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
                {t("previewBadge")}
              </p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                {t("previewTitle")}
              </h2>
            </div>

            <div className="w-fit rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] text-zinc-200 shadow-lg backdrop-blur-xl sm:px-4 sm:text-xs">
              {t("previewLive")}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-4 shadow-xl">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/35 via-fuchsia-500/15 to-blue-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%)]" />
                <PlayCircle size={50} className="text-white/95 sm:size-[58px]" />
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-base font-bold sm:text-lg">{t("clipATitle")}</h3>
                <p className="text-sm text-zinc-400">{t("clipAGame")}</p>
                <p className="text-xs text-zinc-500">{t("clipAUser")}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-4 shadow-xl">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/35 via-cyan-500/15 to-sky-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%)]" />
                <PlayCircle size={50} className="text-white/95 sm:size-[58px]" />
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-base font-bold sm:text-lg">{t("clipBTitle")}</h3>
                <p className="text-sm text-zinc-400">{t("clipBGame")}</p>
                <p className="text-xs text-zinc-500">{t("clipBUser")}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800/90 shadow-inner">
            <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 shadow-[0_0_20px_rgba(99,102,241,0.35)]" />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 sm:text-sm">
            <span>{t("previewLeft")}</span>
            <span>{t("previewRight")}</span>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-zinc-900/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6 md:rounded-[2rem]">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
            {t("whyBadge")}
          </p>
          <h2 className="mt-1 text-xl font-black sm:text-2xl">{t("whyTitle")}</h2>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-lg transition hover:border-purple-400/20 hover:bg-zinc-950">
              <div className="mb-3 inline-flex rounded-xl bg-purple-500/15 p-2.5 text-purple-300 ring-1 ring-purple-400/10">
                <Swords size={18} />
              </div>
              <h3 className="font-semibold text-white">{t("why1Title")}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{t("why1Text")}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-lg transition hover:border-blue-400/20 hover:bg-zinc-950">
              <div className="mb-3 inline-flex rounded-xl bg-blue-500/15 p-2.5 text-blue-300 ring-1 ring-blue-400/10">
                <Trophy size={18} />
              </div>
              <h3 className="font-semibold text-white">{t("why2Title")}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{t("why2Text")}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-lg transition hover:border-emerald-400/20 hover:bg-zinc-950">
              <div className="mb-3 inline-flex rounded-xl bg-emerald-500/15 p-2.5 text-emerald-300 ring-1 ring-emerald-400/10">
                <Shield size={18} />
              </div>
              <h3 className="font-semibold text-white">{t("why3Title")}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{t("why3Text")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-white/10 bg-zinc-900/75 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6 md:rounded-[2rem] md:p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
            {t("featuresBadge")}
          </p>
          <h2 className="mt-1 text-xl font-black sm:text-2xl">{t("featuresTitle")}</h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-xl transition hover:-translate-y-1 hover:border-purple-400/20">
            <div className="mb-4 inline-flex rounded-2xl bg-purple-500/15 p-3 text-purple-300 ring-1 ring-purple-400/10">
              <Upload size={20} />
            </div>
            <h3 className="text-lg font-bold">{t("feature1Title")}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t("feature1Text")}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-xl transition hover:-translate-y-1 hover:border-blue-400/20">
            <div className="mb-4 inline-flex rounded-2xl bg-blue-500/15 p-3 text-blue-300 ring-1 ring-blue-400/10">
              <Swords size={20} />
            </div>
            <h3 className="text-lg font-bold">{t("feature2Title")}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t("feature2Text")}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-xl transition hover:-translate-y-1 hover:border-amber-400/20">
            <div className="mb-4 inline-flex rounded-2xl bg-amber-500/15 p-3 text-amber-300 ring-1 ring-amber-400/10">
              <Trophy size={20} />
            </div>
            <h3 className="text-lg font-bold">{t("feature3Title")}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t("feature3Text")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}