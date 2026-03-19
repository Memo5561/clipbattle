"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

type Clip = {
  id: string;
  title: string;
  game: string | null;
  votes: number;
  username: string | null;
  video_url: string;
};

export default function LeaderboardPage() {
  const t = useTranslations("Leaderboard");
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setErrorText(null);

      const {data, error} = await supabase
        .from("clips")
        .select("*")
        .order("votes", {ascending: false})
        .limit(50);

      if (!mounted) return;

      if (error) {
        console.error("Fehler beim Laden des Leaderboards:", error.message);
        setClips([]);
        setErrorText(t("loadError"));
        setLoading(false);
        return;
      }

      setClips((data as Clip[]) || []);
      setLoading(false);
    };

    fetchLeaderboard();

    return () => {
      mounted = false;
    };
  }, [t]);

  if (loading) {
    return (
      <ProtectedPage>
        <div className="min-h-screen text-white">
          <section className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center backdrop-blur-xl">
            <p className="text-zinc-400">{t("loading")}</p>
          </section>
        </div>
      </ProtectedPage>
    );
  }

  if (errorText) {
    return (
      <ProtectedPage>
        <div className="min-h-screen text-white">
          <section className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center">
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            <p className="mt-3 text-zinc-400">{errorText}</p>
          </section>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen text-white">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-xl">
            <p className="mb-3 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1 text-xs text-zinc-400">
              {t("badge")}
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-2 text-zinc-400">
              {t("subtitle")}
            </p>
          </section>

          {clips.length === 0 ? (
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center">
              <p className="text-zinc-400">{t("empty")}</p>
            </section>
          ) : (
            <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-zinc-800 bg-zinc-950/80 text-sm text-zinc-400">
                    <tr>
                      <th className="px-6 py-4">{t("rank")}</th>
                      <th className="px-6 py-4">{t("clip")}</th>
                      <th className="px-6 py-4">{t("game")}</th>
                      <th className="px-6 py-4">{t("creator")}</th>
                      <th className="px-6 py-4">{t("votes")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clips.map((clip, index) => (
                      <tr
                        key={clip.id}
                        className="border-b border-zinc-800/80 transition hover:bg-white/5"
                      >
                        <td className="px-6 py-4 font-bold text-white">
                          #{index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-24 overflow-hidden rounded-xl border border-zinc-800 bg-black">
                              <video
                                src={clip.video_url}
                                muted
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-white">
                                {clip.title}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-zinc-300">
                          {clip.game || t("unknownGame")}
                        </td>

                        <td className="px-6 py-4 text-zinc-300">
                          {clip.username || t("unknownUser")}
                        </td>

                        <td className="px-6 py-4 font-medium text-zinc-200">
                          ❤️ {clip.votes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}