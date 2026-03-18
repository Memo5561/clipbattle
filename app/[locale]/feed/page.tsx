"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
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
    let bestDistance = Infinity;

    clips.forEach((clip) => {
      const section = sectionRefs.current[clip.id];
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportCenter);

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

      const {data, error} = await supabase
        .from("clips")
        .select("*")
        .order("created_at", {ascending: false});

      if (error) {
        console.error(error.message);
        setLoading(false);
        return;
      }

      setClips((data as Clip[]) || []);

      if (user) {
        const {data: likes} = await supabase
          .from("clip_likes")
          .select("clip_id")
          .eq("user_id", user.id);

        setLikedClipIds((likes || []).map((l) => l.clip_id));
      }

      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!clips.length) return;

    const timeout = setTimeout(playActiveVideo, 200);

    const handleScroll = () => playActiveVideo();
    const container = scrollContainerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [clips, playActiveVideo]);

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  const triggerLikeAnimation = (id: string) => {
    setAnimatedLikeId(id);
    setTimeout(() => setAnimatedLikeId(null), 300);
  };

  const handleLike = async (clip: Clip) => {
    if (!userId || likingId) return;

    const isLiked = likedClipIds.includes(clip.id);
    setLikingId(clip.id);

    if (!isLiked) {
      await supabase.from("clip_likes").insert({
        clip_id: clip.id,
        user_id: userId
      });

      const newVotes = clip.votes + 1;

      await supabase
        .from("clips")
        .update({votes: newVotes})
        .eq("id", clip.id);

      setLikedClipIds((prev) => [...prev, clip.id]);
      setClips((prev) =>
        prev.map((c) => (c.id === clip.id ? {...c, votes: newVotes} : c))
      );

      triggerLikeAnimation(clip.id);
    } else {
      await supabase
        .from("clip_likes")
        .delete()
        .eq("clip_id", clip.id)
        .eq("user_id", userId);

      const newVotes = Math.max(clip.votes - 1, 0);

      await supabase
        .from("clips")
        .update({votes: newVotes})
        .eq("id", clip.id);

      setLikedClipIds((prev) => prev.filter((id) => id !== clip.id));
      setClips((prev) =>
        prev.map((c) => (c.id === clip.id ? {...c, votes: newVotes} : c))
      );

      triggerLikeAnimation(clip.id);
    }

    setLikingId(null);
  };

  const handleDoubleTap = (clipId: string) => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      const clip = clips.find((c) => c.id === clipId);
      if (clip) handleLike(clip);

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

  return (
    <ProtectedPage>
      <div className="fixed inset-0 bg-black text-white">
        <div
          ref={scrollContainerRef}
          className="h-screen snap-y snap-mandatory overflow-y-auto"
        >
          {clips.map((clip) => {
            const isLiked = likedClipIds.includes(clip.id);

            return (
              <section
                key={clip.id}
                ref={(el) => (sectionRefs.current[clip.id] = el)}
                className="relative h-screen snap-start"
              >
                <video
                  ref={(el) => (videoRefs.current[clip.id] = el)}
                  src={clip.video_url}
                  muted={muted}
                  loop
                  playsInline
                  onClick={() => handleDoubleTap(clip.id)}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="absolute top-6 right-4 z-20 bg-black/50 p-3 rounded-full"
                >
                  {muted ? <VolumeX /> : <Volume2 />}
                </button>

                {/* Like */}
                <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center">
                  <button onClick={() => handleLike(clip)}>
                    <Heart
                      className={`h-8 w-8 ${
                        isLiked ? "text-red-500 fill-red-500" : "text-white"
                      }`}
                    />
                  </button>
                  <span>{clip.votes}</span>
                </div>

                {/* Info */}
                <div className="absolute bottom-10 left-4 right-20 z-20">
                  <h2 className="text-2xl font-bold">{clip.title}</h2>

                  {/* 🔥 USER + BUTTON */}
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-sm text-zinc-300">
                      {clip.username || "Unknown"}
                    </p>

                    <FriendRequestButton targetUserId={clip.user_id} />
                  </div>
                </div>

                {/* Double Tap Heart */}
                {showHeart === clip.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="h-24 w-24 text-white animate-ping" />
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