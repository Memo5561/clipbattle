"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../../i18n/navigation";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import FriendRequestButton from "../../components/friend-request-button";
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
  const lastTapRef = useRef<number>(0);
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
    if (!userId || likingId) return;

    const isLiked = likedClipIds.includes(clip.id);
    setLikingId(clip.id);

    if (!isLiked) {
      const {error: likeError} = await supabase.from("clip_likes").insert({
        clip_id: clip.id,
        user_id: userId
      });

      if (likeError) {
        console.error("Like insert error:", likeError.message);
        setLikingId(null);
        return;
      }

      const newVotes = clip.votes + 1;

      const {error: votesError} = await supabase
        .from("clips")
        .update({votes: newVotes})
        .eq("id", clip.id);

      if (votesError) {
        console.error("Votes update error:", votesError.message);
        setLikingId(null);
        return;
      }

      setLikedClipIds((prev) => [...prev, clip.id]);
      setClips((prev) =>
        prev.map((c) => (c.id === clip.id ? {...c, votes: newVotes} : c))
      );
    } else {
      const {error: unlikeError} = await supabase
        .from("clip_likes")
        .delete()
        .eq("clip_id", clip.id)
        .eq("user_id", userId);

      if (unlikeError) {
        console.error("Like delete error:", unlikeError.message);
        setLikingId(null);
        return;
      }

      const newVotes = Math.max(clip.votes - 1, 0);

      const {error: votesError} = await supabase
        .from("clips")
        .update({votes: newVotes})
        .eq("id", clip.id);

      if (votesError) {
        console.error("Votes update error:", votesError.message);
        setLikingId(null);
        return;
      }

      setLikedClipIds((prev) => prev.filter((id) => id !== clip.id));
      setClips((prev) =>
        prev.map((c) => (c.id === clip.id ? {...c, votes: newVotes} : c))
      );
    }

    setLikingId(null);
  };

  const handleDoubleTap = (clipId: string) => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      const clip = clips.find((c) => c.id === clipId);

      if (clip && !likedClipIds.includes(clip.id)) {
        handleLike(clip);
      }

      setShowHeart(clipId);
      setTimeout(() => setShowHeart(null), 600);
    }

    lastTapRef.current = now;
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="flex h-screen items-center justify-center text-white">
          {t("loading")}
        </div>
      </ProtectedPage>
    );
  }

  if (clips.length === 0) {
    return (
      <ProtectedPage>
        <div className="flex h-screen items-center justify-center px-6 text-center text-white">
          <div>
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
                className="relative h-screen snap-start"
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
                  onClick={() => handleDoubleTap(clip.id)}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/90" />

                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute top-6 right-4 z-20 rounded-full border border-white/10 bg-black/45 p-3 backdrop-blur-md transition hover:bg-black/60"
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLike(clip)}
                    disabled={likingId === clip.id || !userId}
                    className="rounded-full bg-black/35 p-2.5 backdrop-blur-md transition hover:scale-105 disabled:opacity-60"
                  >
                    <Heart
                      className={`h-9 w-9 transition ${
                        isLiked
                          ? "scale-110 fill-red-500 text-red-500"
                          : "text-white hover:scale-110"
                      }`}
                    />
                  </button>
                  <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {clip.votes}
                  </span>
                </div>

                <div className="absolute bottom-10 left-4 right-20 z-20 space-y-3">
                  <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
                    {clip.title}
                  </h2>

                  {clip.game && (
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                      🎮 {clip.game}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${clip.user_id}`}
                      className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:scale-105 hover:border-white/30 hover:bg-black/50"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white shadow-md">
                        {(clip.username || t("unknownUser"))[0]?.toUpperCase()}
                      </div>
                      <span className="group-hover:underline">
                        @{clip.username || t("unknownUser")}
                      </span>
                    </Link>

                    {clip.user_id && (
                      <FriendRequestButton targetUserId={clip.user_id} />
                    )}
                  </div>
                </div>

                {showHeart === clip.id && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <Heart className="h-24 w-24 animate-ping text-white" />
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