"use client";

import {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {Volume2, VolumeX, Heart} from "lucide-react";

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
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

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

      const loaded = (data as Clip[]) || [];
      setClips(loaded);

      const initialMuted: Record<string, boolean> = {};
      loaded.forEach((clip) => {
        initialMuted[clip.id] = true;
      });
      setMutedMap(initialMuted);

      setLoading(false);
    };

    fetchClips();
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
      {
        threshold: [0.25, 0.5, 0.7, 0.9]
      }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [clips]);

  const toggleMute = (clipId: string) => {
    const video = videoRefs.current[clipId];
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;

    setMutedMap((prev) => ({
      ...prev,
      [clipId]: nextMuted
    }));

    video.play().catch(() => {});
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-zinc-400">{t("loading")}</p>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="text-white">
        {clips.length === 0 ? (
          <section className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center">
            <p className="text-zinc-400">{t("empty")}</p>
          </section>
        ) : (
          <div className="h-[calc(100dvh-150px)] snap-y snap-mandatory overflow-y-auto rounded-[2rem] border border-zinc-800 bg-black">
            {clips.map((clip) => (
              <section
                key={clip.id}
                className="relative h-[calc(100dvh-150px)] snap-start overflow-hidden"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[clip.id] = el;
                  }}
                  src={clip.video_url}
                  muted={mutedMap[clip.id] ?? true}
                  loop
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                <div className="absolute right-4 top-4 z-20">
                  <button
                    type="button"
                    onClick={() => toggleMute(clip.id)}
                    className="rounded-full bg-black/55 p-3 text-white backdrop-blur transition hover:bg-black/75"
                  >
                    {mutedMap[clip.id] ?? true ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
                  <div className="mx-auto max-w-5xl">
                    <div className="flex items-end justify-between gap-4">
                      <div className="max-w-[78%]">
                        <div className="mb-3 inline-block rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
                          {t("badge")}
                        </div>

                        <h1 className="line-clamp-2 text-2xl font-bold sm:text-3xl">
                          {clip.title}
                        </h1>

                        <p className="mt-2 text-sm text-zinc-300 sm:text-base">
                          {clip.game || t("gameFallback")}
                        </p>

                        <p className="mt-2 text-sm text-zinc-400">
                          {t("postedBy")}:{" "}
                          <span className="font-semibold text-white">
                            {clip.username || t("unknownUser")}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-2 rounded-3xl bg-black/35 px-4 py-3 backdrop-blur">
                        <Heart size={22} className="fill-white text-white" />
                        <span className="text-sm font-semibold">
                          {clip.votes}
                        </span>
                        <span className="text-[11px] text-zinc-300">
                          {t("votes")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}