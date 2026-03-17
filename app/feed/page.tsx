"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Clip = {
  id: string;
  title: string;
  game: string;
  video_url: string;
  votes?: number;
};

export default function FeedPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});
  const [likedAnimations, setLikedAnimations] = useState<Record<string, boolean>>(
    {}
  );
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    fetchClips();
  }, []);

  async function fetchClips() {
    const { data, error } = await supabase
      .from("clips")
      .select("*")
      .not("video_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fehler beim Laden der Clips:", error.message);
      return;
    }

    const loadedClips = (data || []) as Clip[];
    setClips(loadedClips);

    const initialMuted: Record<string, boolean> = {};
    loadedClips.forEach((clip) => {
      initialMuted[clip.id] = true;
    });
    setMutedStates(initialMuted);
  }

  async function handleLike(id: string, currentVotes: number = 0) {
    const nextVotes = currentVotes + 1;

    // Sofort im UI updaten, damit das Video nicht stoppt
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === id ? { ...clip, votes: nextVotes } : clip
      )
    );

    // Herz-Animation starten
    setLikedAnimations((prev) => ({
      ...prev,
      [id]: true,
    }));

    setTimeout(() => {
      setLikedAnimations((prev) => ({
        ...prev,
        [id]: false,
      }));
    }, 500);

    // Im Hintergrund in Supabase speichern
    const { error } = await supabase
      .from("clips")
      .update({ votes: nextVotes })
      .eq("id", id);

    if (error) {
      console.error("Fehler beim Liken:", error.message);

      // Falls Fehler: UI wieder zurücksetzen
      setClips((prev) =>
        prev.map((clip) =>
          clip.id === id ? { ...clip, votes: currentVotes } : clip
        )
      );
    }
  }

  function toggleMute(index: number, clipId: string) {
    const video = videoRefs.current[index];
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;

    setMutedStates((prev) => ({
      ...prev,
      [clipId]: nextMuted,
    }));

    if (!nextMuted) {
      void video.play().catch(() => {});
    }
  }

  function handleVideoClick(index: number, clipId: string) {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      setMutedStates((prev) => ({
        ...prev,
        [clipId]: false,
      }));
      void video.play().catch(() => {});
      return;
    }

    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    const currentVideos = videoRefs.current;

    currentVideos.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      currentVideos.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [clips.length]);

  if (clips.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">Noch keine Clips im Feed</h1>
          <p className="text-zinc-400">
            Lade zuerst Clips hoch, damit sie hier angezeigt werden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar h-screen snap-y snap-mandatory overflow-y-scroll bg-black">
      {clips.map((clip, index) => (
        <div
          key={clip.id}
          className="flex h-screen w-full snap-start items-center justify-center bg-black"
        >
          <div className="relative h-full w-full max-w-md overflow-hidden bg-black">
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={clip.video_url}
              className="h-full w-full cursor-pointer object-cover"
              loop
              muted={mutedStates[clip.id] ?? true}
              playsInline
              onClick={() => handleVideoClick(index, clip.id)}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-4 text-white">
              <h2 className="text-xl font-bold">{clip.title}</h2>
              <p className="text-gray-300">{clip.game}</p>
            </div>

            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-4 text-white">
              <button
                onClick={() => handleLike(clip.id, clip.votes || 0)}
                className="relative flex flex-col items-center"
              >
                <Heart
                  size={32}
                  className={`transition-all duration-300 ${
                    likedAnimations[clip.id]
                      ? "scale-150 fill-pink-500 text-pink-500"
                      : "text-white"
                  }`}
                />
                <span className="text-sm">{clip.votes || 0}</span>

                {likedAnimations[clip.id] && (
                  <span className="pointer-events-none absolute -top-3 text-2xl text-pink-500 animate-ping">
                    ♥
                  </span>
                )}
              </button>

              <button
                onClick={() => toggleMute(index, clip.id)}
                className="flex flex-col items-center"
              >
                {mutedStates[clip.id] ?? true ? (
                  <VolumeX size={32} />
                ) : (
                  <Volume2 size={32} />
                )}
                <span className="text-sm">
                  {mutedStates[clip.id] ?? true ? "Stumm" : "Ton an"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}