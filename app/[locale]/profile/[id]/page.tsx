"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {useParams} from "next/navigation";
import {Link} from "../../../../i18n/navigation";
import {supabase} from "../../../../lib/supabase";

type Clip = {
  id: string;
  title: string;
  game: string | null;
  video_url: string;
  votes: number;
  username: string | null;
  user_id: string;
};

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const params = useParams();
  const userId = params.id as string;

  const [username, setUsername] = useState<string>("User");
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);

      const {data, error} = await supabase
        .from("clips")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {ascending: false});

      if (!mounted) return;

      if (error) {
        console.error("Profile load error:", error.message);
        setClips([]);
        setLoading(false);
        return;
      }

      const loadedClips = (data as Clip[]) || [];
      setClips(loadedClips);

      if (loadedClips.length > 0) {
        setUsername(loadedClips[0].username || "User");
      } else {
        setUsername("User");
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const totalVotes = useMemo(() => {
    return clips.reduce((sum, clip) => sum + (clip.votes || 0), 0);
  }, [clips]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-xl">
          <p className="mb-3 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1 text-xs text-zinc-400">
            {t("profile")}
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">@{username}</h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">{t("clips")}</p>
              <p className="mt-1 text-2xl font-bold">{clips.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">{t("totalVotes")}</p>
              <p className="mt-1 text-2xl font-bold">{totalVotes}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">{t("creator")}</p>
              <p className="mt-1 text-2xl font-bold">@{username}</p>
            </div>
          </div>
        </section>

        {clips.length === 0 ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center">
            <p className="text-zinc-400">{t("empty")}</p>

            <Link
              href="/feed"
              className="mt-4 inline-block rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white transition hover:bg-zinc-700"
            >
              {t("backToFeed")}
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {clips.map((clip) => (
              <article
                key={clip.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-xl"
              >
                <div className="bg-black">
                  <video
                    src={clip.video_url}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full object-cover"
                  />
                </div>

                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="line-clamp-1 text-xl font-bold text-white">
                      {clip.title}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      {clip.game || t("unknownGame")}
                    </p>
                  </div>

                  <div className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 w-fit">
                    ❤️ {clip.votes} {t("votes")}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
