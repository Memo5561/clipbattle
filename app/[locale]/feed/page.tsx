"use client";

import {useEffect, useRef, useState} from "react";
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

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const load = async () => {
      const {data, error} = await supabase
        .from("clips")
        .select("*")
        .order("created_at", {ascending: false});

      if (error) {
        console.error("Fehler beim Laden des Feeds:", error.message);
        setLoading(false);
        return;
      }

      setClips((data as Clip[]) || []);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!clips.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {threshold: [0.25, 0.5, 0.7, 0.9]}
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [clips]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);

    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = newMuted;
      }
    });
  };

  const handleLike = async (clipId: string) => {
    if (likingId) return;

    const clip = clips.find((item) => item.id === clipId);
    if (!clip) return;

    const newVotes = (clip.votes || 0) + 1;
    setLikingId(clipId);

    const {error} = await supabase
      .from("clips")
      .update({votes: newVotes})
      .eq("id", clipId);

    if (error) {
      console.error("Fehler beim Liken:", error.message);
      setLikingId(null);
      return;
    }

    setClips((prev) =>
      prev.map((item) =>
        item.id === clipId ? {...item, votes: newVotes} : item
      )
    );

    setLikingId(null);
  };

  const handleDoubleTap = (clipId: string) => {
    const now = Date.now();
    const doubleTapDelay = 300;

    if (now - lastTapRef.current < doubleTapDelay) {
      handleLike(clipId);
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
        <div className="h-[100dvh] snap-y snap-mandatory overflow-y-auto">
          {clips.map((clip) => (
            <section
              key={clip.id}
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
                autoPlay
                onClick={() => handleDoubleTap(clip.id)}
                className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover brightness-90"
              />

              {showHeart === clip.id && (
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                  <Heart className="h-24 w-24 animate-[scaleHeart_0.7s_ease-out] fill-white text-white" />
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
                  onClick={() => handleLike(clip.id)}
                  disabled={likingId === clip.id}
                  className="flex flex-col items-center text-white disabled:opacity-60"
                >
                  <Heart className="h-8 w-8 fill-white text-white" />
                  <span className="mt-1 text-sm font-semibold">
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
          ))}
        </div>
      </div>
    </ProtectedPage>
  );
}