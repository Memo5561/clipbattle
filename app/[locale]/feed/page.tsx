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

                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />

                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute top-6 right-4 z-20 rounded-full bg-black/50 p-3"
                >
                  {muted ? <VolumeX /> : <Volume2 />}
                </button>

                <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleLike(clip)}
                    disabled={likingId === clip.id || !userId}
                  >
                    <Heart
                      className={`h-8 w-8 ${
                        isLiked ? "fill-red-500 text-red-500" : "text-white"
                      }`}
                    />
                  </button>
                  <span>{clip.votes}</span>
                </div>

                <div className="absolute bottom-10 left-4 right-20 z-20">
                  <h2 className="text-2xl font-bold">{clip.title}</h2>

                  {clip.game && (
                    <p className="mt-1 text-sm text-zinc-400">{clip.game}</p>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`/profile/${clip.user_id}`}
                      className="inline-flex items-center rounded-full border border-white/15 bg-black/35 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm transition hover:scale-105 hover:border-white/30 hover:bg-black/50"
                    >
                      @{clip.username || t("unknownUser")}
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