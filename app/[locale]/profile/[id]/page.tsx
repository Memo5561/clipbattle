"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {useParams} from "next/navigation";
import {Link} from "../../../../i18n/navigation";
import {supabase} from "../../../../lib/supabase";
import FollowButton from "../../../components/follow-button";
import {Clapperboard, Heart} from "lucide-react";

type Clip = {
  id: string;
  title: string;
  game: string | null;
  video_url: string;
  votes: number;
  username: string | null;
  user_id: string;
  created_at?: string;
};

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const params = useParams();
  const userId = params.id as string;

  const [username, setUsername] = useState<string>("User");
  const [clips, setClips] = useState<Clip[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);

      const {data, error} = await supabase
        .from("clips_with_likes")
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

      const {count: followersCount, error: followersError} = await supabase
        .from("follows")
        .select("*", {count: "exact", head: true})
        .eq("following_id", userId);

      const {count: followingCount, error: followingError} = await supabase
        .from("follows")
        .select("*", {count: "exact", head: true})
        .eq("follower_id", userId);

      if (!mounted) return;

      if (followersError) {
        console.error("Followers count error:", followersError.message);
      }

      if (followingError) {
        console.error("Following count error:", followingError.message);
      }

      setFollowers(followersCount || 0);
      setFollowing(followingCount || 0);
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

  const initial = (username?.[0] || "U").toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium backdrop-blur-md">
          {t("loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/feed"
          className="inline-flex items-center text-sm text-zinc-400 transition hover:text-white"
        >
          ← {t("backToFeed")}
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/75 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_26%)]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-500/40 blur-2xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-2xl font-black text-white ring-2 ring-white/10 sm:h-20 sm:w-20 sm:text-3xl">
                  {initial}
                </div>
              </div>

              <div>
                <p className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300">
                  {t("profile")}
                </p>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
                    @{username}
                  </span>
                </h1>

                <p className="mt-1 text-sm text-zinc-400">
                  ClipBattle Creator
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-5">
                  <FollowButton targetUserId={userId} />

                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{followers}</p>
                      <p className="text-xs text-zinc-400">Followers</p>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{following}</p>
                      <p className="text-xs text-zinc-400">Following</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <StatCard
                icon={<Clapperboard size={18} />}
                label={t("clips")}
                value={clips.length}
              />
              <StatCard
                icon={<Heart size={18} />}
                label={t("totalVotes")}
                value={totalVotes}
              />
            </div>
          </div>
        </section>

        {clips.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-zinc-900/75 p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <p className="text-zinc-400">{t("empty")}</p>

            <Link
              href="/feed"
              className="mt-4 inline-block rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {t("backToFeed")}
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {clips.map((clip) => (
              <article
                key={clip.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/75 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-1"
              >
                <div className="relative bg-black">
                  <video
                    src={clip.video_url}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition group-hover:opacity-100" />
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

                  <div className="flex items-center justify-between">
                    <div className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-xl">
                      ❤️ {clip.votes} {t("votes")}
                    </div>

                    <span className="text-xs text-zinc-500">
                      @{clip.username || "User"}
                    </span>
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

function StatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-center backdrop-blur-xl">
      <div className="mb-2 text-zinc-300">
        {icon}
      </div>

      <p className="text-xs text-zinc-400">{label}</p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}