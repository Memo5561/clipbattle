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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      const {data, error} = await supabase
        .from("clips")
        .select("*")
        .order("votes", {ascending: false})
        .limit(50);

      if (error) {
        console.error(error.message);
        setClips([]);
        setLoading(false);
        return;
      }

      setClips((data as Clip[]) || []);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getRankStyle = (index: number) => {
    if (index === 0)
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-300/10 border-yellow-400/20 shadow-[0_0_25px_rgba(250,204,21,0.25)]";
    if (index === 1)
      return "bg-gradient-to-r from-zinc-300/10 to-zinc-400/10 border-zinc-300/20";
    if (index === 2)
      return "bg-gradient-to-r from-amber-600/20 to-amber-400/10 border-amber-400/20";
    return "bg-zinc-900/70 border-zinc-800";
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="flex min-h-screen items-center justify-center text-white">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
            {t("loading")}
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* HEADER */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70 p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_30%)]" />

            <p className="mb-3 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-zinc-300">
              {t("badge")}
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-2 text-zinc-400">
              {t("subtitle")}
            </p>
          </section>

          {/* LIST */}
          {clips.map((clip, index) => (
            <div
              key={clip.id}
              className={`flex flex-col gap-4 rounded-3xl border p-4 backdrop-blur-xl transition hover:scale-[1.01] sm:flex-row sm:items-center ${getRankStyle(index)}`}
            >
              
              {/* RANK */}
              <div className="flex items-center justify-center text-2xl font-black w-14">
                #{index + 1}
              </div>

              {/* VIDEO */}
              <div className="w-full max-w-[200px] overflow-hidden rounded-2xl border border-white/10">
                <video
                  src={clip.video_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                />
              </div>

              {/* INFO */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">
                  {clip.title}
                </h2>

                <p className="text-sm text-zinc-400">
                  🎮 {clip.game || t("unknownGame")}
                </p>

                <p className="text-sm text-zinc-500">
                  @{clip.username || t("unknownUser")}
                </p>
              </div>

              {/* VOTES */}
              <div className="text-right">
                <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl">
                  ❤️ {clip.votes}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </ProtectedPage>
  );
}