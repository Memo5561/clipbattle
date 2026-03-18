"use client";

import {useEffect, useRef, useState} from "react";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {Heart, Volume2, VolumeX} from "lucide-react";

type Clip = {
  id: string;
  title: string;
  video_url: string;
  votes: number;
  username: string | null;
};

export default function FeedPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [muted, setMuted] = useState(true);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    const load = async () => {
      const {data} = await supabase
        .from("clips")
        .select("*")
        .order("created_at", {ascending: false});

      setClips(data || []);
    };

    load();
  }, []);

  // Auto play / pause
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {threshold: 0.7}
    );

    Object.values(videoRefs.current).forEach((v) => {
      if (v) observer.observe(v);
    });

    return () => observer.disconnect();
  }, [clips]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);

    Object.values(videoRefs.current).forEach((v) => {
      if (v) v.muted = newMuted;
    });
  };

  return (
    <ProtectedPage>
      <div className="fixed inset-0 z-50 bg-black text-white">
        <div className="h-[100dvh] snap-y snap-mandatory overflow-y-auto">
          {clips.map((clip) => (
            <section
              key={clip.id}
              className="relative h-[100dvh] snap-start"
            >
              {/* VIDEO */}
              <video
                ref={(el) => (videoRefs.current[clip.id] = el)}
                src={clip.video_url}
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* DARK OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

              {/* RIGHT SIDE ACTIONS */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
                <button className="flex flex-col items-center">
                  <Heart className="h-7 w-7 fill-white" />
                  <span className="text-sm">{clip.votes}</span>
                </button>

                <button onClick={toggleMute}>
                  {muted ? <VolumeX /> : <Volume2 />}
                </button>
              </div>

              {/* TEXT OVERLAY */}
              <div className="absolute bottom-10 left-4 right-20">
                <h2 className="text-2xl font-bold">{clip.title}</h2>
                <p className="text-sm text-gray-300">
                  @{clip.username || "user"}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </ProtectedPage>
  );
}