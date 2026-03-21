"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../../i18n/navigation";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import FollowButton from "../../components/follow-button";
import {Heart, Volume2, VolumeX} from "lucide-react";

type Clip = {
  id: string;
  title: string;
  game: string | null;
  video_url: string;
  votes: number;
  username: string | null;
  user_id: string;
};

export default function FeedPage() {
  const t = useTranslations("Feed");

  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [likedClipIds, setLikedClipIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showHeart, setShowHeart] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const lastTapMap = useRef<Record<string, number>>({});
  const likeLockRef = useRef<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const playActiveVideo = useCallback(() => {
    const center = window.innerHeight / 2;
    let bestId: string | null = null;
    let bestDistance = Infinity;

    clips.forEach((clip) => {
      const el = sectionRefs.current[clip.id];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(mid - center);

      if (dist < bestDistance) {
        bestDistance = dist;
        bestId = clip.id;
      }
    });

    clips.forEach((clip) => {
      const video = videoRefs.current[clip.id];
      if (!video) return;

      if (clip.id === bestId) {
        video.muted = muted;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [clips, muted]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const {
        data: {user}
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const {data: clipsData, error: clipsError} = await supabase
        .from("clips")
        .select("*")
        .order("created_at", {ascending: false});

      if (clipsError) {
        console.error("Feed load error:", clipsError.message);
        setClips([]);
        setLoading(false);
        return;
      }

      setClips((clipsData as Clip[]) || []);

      if (user) {
        const {data: likesData, error: likesError} = await supabase
          .from("clip_likes")
          .select("clip_id")
          .eq("user_id", user.id);

        if (likesError) {
          console.error("Likes load error:", likesError.message);
        } else {
          setLikedClipIds((likesData || []).map((item) => item.clip_id));
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!clips.length) return;

    const timeout = setTimeout(() => {
      playActiveVideo();
    }, 200);

    const handleScroll = () => {
      playActiveVideo();
    };

    const handleResize = () => {
      playActiveVideo();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        Object.values(videoRefs.current).forEach((video) => video?.pause());
      } else {
        setTimeout(() => {
          playActiveVideo();
        }, 150);
      }
    };

    const container = scrollRef.current;

    container?.addEventListener("scroll", handleScroll, {passive: true});
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeout);
      container?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clips, playActiveVideo]);

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);

    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = nextMuted;
      }
    });

    setTimeout(() => {
      playActiveVideo();
    }, 50);
  };

  const handleLike = async (clip: Clip) => {
    if (!userId) return;
    if (likingId) return;
    if (likeLockRef.current[clip.id]) return;

    likeLockRef.current[clip.id] = true;
    setLikingId(clip.id);

    const isLiked = likedClipIds.includes(clip.id);

    if (!isLiked) {
      setLikedClipIds((prev) => [...prev, clip.id]);
      setClips((prev) =>
        prev.map((c) =>
          c.id === clip.id ? {...c, votes: c.votes + 1} : c
        )
      );
    } else {
      setLikedClipIds((prev) => prev.filter((id) => id !== clip.id));
      setClips((prev) =>
        prev.map((c) =>
          c.id === clip.id ? {...c, votes: Math.max(c.votes - 1, 0)} : c
        )
      );
    }

    if (!isLiked) {
      const {error: likeError} = await supabase.from("clip_likes").insert({
        clip_id: clip.id,
        user_id: userId
      });

      if (likeError) {
        console.error("Like insert error:", likeError.message);

        setLikedClipIds((prev) => prev.filter((id) => id !== clip.id));
        setClips((prev) =>
          prev.map((c) =>
            c.id === clip.id ? {...c, votes: Math.max(c.votes - 1, 0)} : c
          )
        );

        setLikingId(null);
        likeLockRef.current[clip.id] = false;
        return;
      }

      const {error: votesError} = await supabase
        .from("clips")
        .update({votes: clip.votes + 1})
        .eq("id", clip.id);

      if (votesError) {
        console.error("Votes update error:", votesError.message);

        setLikedClipIds((prev) => prev.filter((id) => id !== clip.id));
        setClips((prev) =>
          prev.map((c) =>
            c.id === clip.id ? {...c, votes: Math.max(c.votes - 1, 0)} : c
          )
        );

        await supabase
          .from("clip_likes")
          .delete()
          .eq("clip_id", clip.id)
          .eq("user_id", userId);

        setLikingId(null);
        likeLockRef.current[clip.id] = false;
        return;
      }
    } else {
      const {error: unlikeError} = await supabase
        .from("clip_likes")
        .delete()
        .eq("clip_id", clip.id)
        .eq("user_id", userId);

      if (unlikeError) {
        console.error("Like delete error:", unlikeError.message);

        setLikedClipIds((prev) => [...prev, clip.id]);
        setClips((prev) =>
          prev.map((c) =>
            c.id === clip.id ? {...c, votes: c.votes + 1} : c
          )
        );

        setLikingId(null);
        likeLockRef.current[clip.id] = false;
        return;
      }

      const newVotes = Math.max(clip.votes - 1, 0);

      const {error: votesError} = await supabase
        .from("clips")
        .update({votes: newVotes})
        .eq("id", clip.id);

      if (votesError) {
        console.error("Votes update error:", votesError.message);

        setLikedClipIds((prev) => [...prev, clip.id]);
        setClips((prev) =>
          prev.map((c) =>
            c.id === clip.id ? {...c, votes: c.votes + 1} : c
          )
        );

        await supabase.from("clip_likes").insert({
          clip_id: clip.id,
          user_id: userId
        });

        setLikingId(null);
        likeLockRef.current[clip.id] = false;
        return;
      }
    }

    setLikingId(null);
    likeLockRef.current[clip.id] = false;
  };

  const handleVideoTouchEnd = (clipId: string) => {
    const now = Date.now();
    const lastTap = lastTapMap.current[clipId] || 0;

    if (now - lastTap < 280) {
      const clip = clips.find((c) => c.id === clipId);

      if (
        clip &&
        !likedClipIds.includes(clip.id) &&
        !likingId &&
        !likeLockRef.current[clip.id]
      ) {
        handleLike(clip);
      }

      setShowHeart(clipId);
      setTimeout(() => setShowHeart(null), 400);

      lastTapMap.current[clipId] = 0;
      return;
    }

    lastTapMap.current[clipId] = now;
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="flex h-screen items-center justify-center bg-black text-white">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium backdrop-blur-md">
            {t("loading")}
          </div>
        </div>
      </ProtectedPage>
    );
  }

  if (clips.length === 0) {
    return (
      <ProtectedPage>
        <div className="flex h-screen items-center justify-center bg-black px-6 text-center text-white">
          <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-md">
            <h1 className="text-2xl font-bold">{t("emptyTitle")}</h1>
            <p className="mt-2 text-zinc-400">{t("emptyText")}</p>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="fixed inset-0 bg-black text-white">
        <div
          ref={scrollRef}
          className="h-screen snap-y snap-mandatory overflow-y-auto"
        >
          {clips.map((clip) => {
            const isLiked = likedClipIds.includes(clip.id);

            return (
              <section
                key={clip.id}
                ref={(el) => {
                  sectionRefs.current[clip.id] = el;
                }}
                className="relative h-screen snap-start overflow-hidden"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[clip.id] = el;
                  }}
                  src={clip.video_url}
                  muted={muted}
                  loop
                  playsInline
                  preload="metadata"
                  onTouchEnd={() => handleVideoTouchEnd(clip.id)}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_22%),linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.18)_28%,rgba(0,0,0,0.55)_62%,rgba(0,0,0,0.92)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute right-4 top-6 z-20 rounded-full border border-white/10 bg-black/40 p-3 text-white shadow-lg backdrop-blur-xl transition hover:scale-105 hover:bg-black/55"
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <div className="absolute bottom-28 right-4 z-20 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleLike(clip)}
                    disabled={likingId === clip.id || !userId}
                    className="group rounded-full border border-white/10 bg-black/35 p-3 shadow-xl backdrop-blur-xl transition hover:scale-110 hover:bg-black/50 disabled:opacity-60"
                  >
                    <Heart
                      className={`h-9 w-9 transition duration-200 ${
                        isLiked
                          ? "like-pulse scale-110 fill-red-500 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.55)]"
                          : "text-white group-hover:scale-110"
                      }`}
                    />
                  </button>

                  <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-xl">
                    {clip.votes}
                  </div>
                </div>

                <div className="absolute bottom-8 left-4 right-20 z-20 space-y-4 sm:bottom-10 sm:left-5">
                  {clip.game && (
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-xl">
                      🎮 {clip.game}
                    </div>
                  )}

                  <div className="max-w-xl">
                    <h2 className="text-[1.7rem] font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)] sm:text-[2rem]">
                      {clip.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/profile/${clip.user_id}`}
                      className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:scale-[1.03] hover:border-white/30 hover:bg-black/50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-xs font-bold text-white shadow-md ring-2 ring-white/10">
                        {(clip.username || t("unknownUser"))[0]?.toUpperCase()}
                      </div>

                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-300/80">
                          Creator
                        </span>
                        <span className="text-sm text-white group-hover:underline">
                          @{clip.username || t("unknownUser")}
                        </span>
                      </div>
                    </Link>

                    {clip.user_id && (
                      <div className="ml-1">
                        <FollowButton targetUserId={clip.user_id} />
                      </div>
                    )}
                  </div>
                </div>

                {showHeart === clip.id && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/10 p-6 backdrop-blur-sm">
                      <Heart className="like-pop h-24 w-24 text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.45)]" />
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </ProtectedPage>
  );
}