"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

type Clip = {
  id: string;
  title: string;
  game: string | null;
  video_url: string;
  votes: number;
  username: string | null;
};

export default function FeedPage() {
  const t = useTranslations("Feed");
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClips = async () => {
      setLoading(true);

      const {data, error} = await supabase
        .from("clips")
        .select("*")
        .order("created_at", {ascending: false});

      if (error) {
        console.error("Fehler beim Laden der Clips:", error.message);
        setClips([]);
        setLoading(false);
        return;
      }

      setClips((data as Clip[]) || []);
      setLoading(false);
    };

    fetchClips();
  }, []);

  return (
    <ProtectedPage>
      <div className="min-h-screen text-white">
        {loading ? (
          <section className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-xl">
            <p className="text-center text-zinc-400">{t("loading")}</p>
          </section>
        ) : (
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
              <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {clips.map((clip) => (
                  <article
                    key={clip.id}
                    className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-xl transition hover:-translate-y-1 hover:border-white/10"
                  >
                    <div className="bg-black">
                      <video
                        src={clip.video_url}
                        controls
                        playsInline
                        className="aspect-video w-full object-cover"
                      />
                    </div>

                    <div className="space-y-3 p-5">
                      <div>
                        <h2 className="line-clamp-1 text-xl font-bold text-white">
                          {clip.title}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                          {clip.game || t("gameFallback")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <p className="text-zinc-500">
                          {t("postedBy")}:{" "}
                          <span className="font-medium text-zinc-300">
                            {clip.username || t("unknownUser")}
                          </span>
                        </p>

                        <div className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                          ❤️ {clip.votes} {t("votes")}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}