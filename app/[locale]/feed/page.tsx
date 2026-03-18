"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {Heart, Volume2, VolumeX} from "lucide-react";

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
  const [muted, setMuted] = useState(true);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [showHeart, setShowHeart] = useState<string | null>(null);
  const [likedClipIds, setLikedClipIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [animatedLikeId, setAnimatedLikeId] = useState<string | null>(null);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const lastTapRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const playActiveVideo = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    let bestId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    clips.forEach((clip) => {
      const section = sectionRefs.current[clip.id];
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
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
        console.error("Fehler beim Laden des Feeds:", clipsError.message);
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
          console.error("Fehler beim Laden der Likes:", likesError.message);
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
    }, 250);

    const handleVisibility = () => {
      if (document.hidden) {
        Object.values(videoRefs.current).forEach((video) => {
          video?.pause();
        });
      } else {
        setTimeout(() => {
          playActiveVideo();
        }, 150);
      }
    };

    const handleScroll = () => {
      playActiveVideo();
    };

    const handleResize = () => {
      playActiveVideo();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, {passive: true});
    }

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [clips, playActiveVideo]);

  const triggerLikeAnimation = (clipId: string) => {
    setAnimatedLikeId(clipId);
    setTimeout(() => {
      setAnimatedLikeId(null);
    }, 350);
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);

    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = newMuted;
      }
    });

    setTimeout(() => {
      playActiveVideo();
    }, 50);
  };

  const handleToggleLike = async (clipId: string) => {
    if (!userId || likingId) return;

    const clip = clips.find((item) => item.id === clipId);
    if (!clip) return;

    const isLiked = likedClipIds.includes(clipId);
    setLikingId(clipId);

    if (!isLiked) {
      const {error: likeError} = await supabase.from("clip_likes").insert({
        clip_id: clipId,
        user_id: userId
      });

      if (likeError) {
        console.error("Fehler beim Speichern des Likes:", likeError.message);
        setLikingId(null);
        return;
      }

      const newVotes = (clip.votes || 0) + 1;

      const {error: updateError} = await supabase
        .from("clips")
        .update({votes: newVotes})
        .eq("id", clipId);

      if (updateError) {
        console.error("Fehler beim Aktualisieren der Votes:", updateError.message);
        setLikingId(null);
        return;
      }

      setLikedClipIds((prev) => [...prev, clipId]);

      setClips((prev) =>
        prev.map((item) =>
          item.id === clipId ? {...item, votes: newVotes} : item
        )
      );

      triggerLikeAnimation(clipId);
    } else {
      const {error: deleteError} = await supabase
        .from("clip_likes")
        .delete()
        .eq("clip_id", clipId)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Fehler beim Entfernen des Likes:", deleteError.message);
        setLikingId(null);
        return;
      }

      const newVotes = Math.max((clip.votes || 0) - 1, 0);

      const {error: updateError} = await supabase
        .from("clips")
        .update({votes: newVotes})
        .eq("id", clipId);

      if (updateError) {
        console.error("Fehler beim Aktualisieren der Votes:", updateError.message);
        setLikingId(null);
        return;
      }

      setLikedClipIds((prev) => prev.filter((id) => id !== clipId));

      setClips((prev) =>
        prev.map((item) =>
          item.id === clipId ? {...item, votes: newVotes} : item
        )
      );

      triggerLikeAnimation(clipId);
    }

    setLikingId(null);
  };

  const handleDoubleTap = (clipId: string) => {
    const now = Date.now();
    const doubleTapDelay = 300;

    if (now - lastTapRef.current < doubleTapDelay) {
      if (!likedClipIds.includes(clipId)) {
        handleToggleLike(clipId);
      }

      setShowHeart(clipId);

      setTimeout(() => {
        setShowHeart(null);
      }, 700);
    }

    lastTapRef.current = now;
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
          <p className="text-zinc-400">{t("loading")}</p>
        </div>
      </ProtectedPage>
    );
  }

  if (clips.length === 0) {
    return (
      <ProtectedPage>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
          <p className="text-zinc-400">{t("empty")}</p>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="fixed inset-0 z-50 bg-black text-white">
        <div
          ref={scrollContainerRef}
          className="h-[100dvh] snap-y snap-mandatory overflow-y-auto"
        >
          {clips.map((clip) => {
            const isLiked = likedClipIds.includes(clip.id);
            const isAnimating = animatedLikeId === clip.id;

            return (
              <section
                key={clip.id}
                ref={(el) => {
                  sectionRefs.current[clip.id] = el;
                }}
                className="relative h-[100dvh] snap-start overflow-hidden bg-black"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[clip.id] = el;
                  }}
                  src={clip.video_url}
                  muted={muted}
                  loop
                  playsInline
                  preload="auto"
                  onClick={() => handleDoubleTap(clip.id)}
                  className="absolute left-1/2 top-1/2 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 object-cover brightness-90"
                />

                {showHeart === clip.id && (
                  <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                    <Heart
                      className={`h-24 w-24 animate-[scaleHeart_0.7s_ease-out] ${
                        isLiked ? "fill-red-500 text-red-500" : "fill-white text-white"
                      }`}
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/85" />

                <div className="absolute right-4 top-6 z-20">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="rounded-full bg-black/55 p-3 text-white backdrop-blur transition hover:bg-black/75"
                  >
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>

                <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-6">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(clip.id)}
                    disabled={likingId === clip.id || !userId}
                    className="flex flex-col items-center text-white disabled:opacity-60"
                  >
                    <Heart
                      className={`h-8 w-8 transition-transform duration-200 ${
                        isLiked ? "fill-red-500 text-red-500" : "fill-white text-white"
                      } ${isAnimating ? "animate-[likePulse_0.35s_ease]" : ""}`}
                    />
                    <span
                      className={`mt-1 text-sm font-semibold transition-transform duration-200 ${
                        isAnimating ? "scale-110" : "scale-100"
                      }`}
                    >
                      {clip.votes}
                    </span>
                    <span className="text-[11px] text-zinc-300">
                      {t("votes")}
                    </span>
                  </button>
                </div>

                <div className="absolute bottom-10 left-4 right-20 z-20">
                  <div className="mb-3 inline-block rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
                    {t("badge")}
                  </div>

                  <h2 className="line-clamp-2 text-3xl font-bold text-white">
                    {clip.title}
                  </h2>

                  <p className="mt-2 text-base text-zinc-300">
                    {clip.game || t("gameFallback")}
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    {t("postedBy")}:{" "}
                    <span className="font-semibold text-white">
                      {clip.username || t("unknownUser")}
                    </span>
                  </p>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </ProtectedPage>
  );
}