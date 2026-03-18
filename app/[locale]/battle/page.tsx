"use client";

import {useEffect, useRef, useState} from "react";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {RefreshCw, Volume2, VolumeX, Trophy} from "lucide-react";

type Clip = {
  id: string;
  title: string;
  video_url: string;
  username: string | null;
  votes: number;
};

export default function BattlePage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [clipA, setClipA] = useState<Clip | null>(null);
  const [clipB, setClipB] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  const [mutedA, setMutedA] = useState(true);
  const [mutedB, setMutedB] = useState(true);

  const fetchClips = async () => {
    const {data} = await supabase
      .from("clips")
      .select("*")
      .order("created_at", {ascending: false});

    if (!data || data.length < 2) {
      setLoading(false);
      return;
    }

    setClips(data);
    generatePair(data);
    setLoading(false);
  };

  const generatePair = (list: Clip[]) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setClipA(shuffled[0]);
    setClipB(shuffled[1]);
    setWinnerId(null);
  };

  useEffect(() => {
    fetchClips();
  }, []);

  const vote = async (clip: Clip) => {
    setWinnerId(clip.id);

    await supabase
      .from("clips")
      .update({votes: clip.votes + 1})
      .eq("id", clip.id);

    setTimeout(() => {
      generatePair(clips);
    }, 800);
  };

  if (loading || !clipA || !clipB) {
    return <div className="mt-20 text-center text-zinc-400">Loading...</div>;
  }

  return (
    <ProtectedPage>
      <div className="mx-auto max-w-5xl space-y-2 text-white">
        <div className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <h1 className="text-xl font-bold">Battle</h1>

          <button
            onClick={() => generatePair(clips)}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2"
          >
            <RefreshCw size={16} />
            Neue Runde
          </button>
        </div>

        <SwipeCard
          clip={clipA}
          videoRef={videoRefA}
          muted={mutedA}
          toggleMute={() => setMutedA(!mutedA)}
          onVote={() => vote(clipA)}
          isWinner={winnerId === clipA.id}
        />

        <div className="text-center text-xs text-zinc-600">VS</div>

        <SwipeCard
          clip={clipB}
          videoRef={videoRefB}
          muted={mutedB}
          toggleMute={() => setMutedB(!mutedB)}
          onVote={() => vote(clipB)}
          isWinner={winnerId === clipB.id}
        />
      </div>
    </ProtectedPage>
  );
}

function SwipeCard({
  clip,
  videoRef,
  muted,
  toggleMute,
  onVote,
  isWinner
}: {
  clip: Clip;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  muted: boolean;
  toggleMute: () => void;
  onVote: () => void;
  isWinner: boolean;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const threshold = 100;
  const progress = Math.min(dragX / threshold, 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    setDragX(diffX > 0 ? diffX : 0);
    setDragY(diffX > 0 ? diffY : 0);
  };

  const handleTouchEnd = () => {
    if (dragX > threshold) {
      onVote();
    }

    setDragX(0);
    setDragY(0);
    setDragging(false);
    startX.current = null;
    startY.current = null;
  };

  const rotate = Math.min(dragX * 0.06, 14);
  const lift = Math.min(dragX * 0.08, 24);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${dragX}px) translateY(${dragY * 0.08 - lift}px) rotate(${rotate}deg)`,
        transition: dragging
          ? "none"
          : "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)"
      }}
    >
      <video
        ref={videoRef}
        src={clip.video_url}
        autoPlay
        loop
        muted={muted}
        playsInline
        className="h-[70vh] w-full object-cover"
      />

      <div
        className="absolute inset-y-0 left-0 bg-emerald-500/30"
        style={{
          width: "100%",
          transform: `scaleX(${progress})`,
          transformOrigin: "left",
          transition: dragging ? "none" : "transform 0.15s ease-out"
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      <div className="absolute bottom-5 left-5">
        <h2 className="text-2xl font-bold">{clip.title}</h2>
        <p className="text-sm text-zinc-400">{clip.username}</p>
      </div>

      <button
        onClick={toggleMute}
        className="absolute left-4 top-4 rounded-full bg-black/60 p-2"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {isWinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
          <Trophy size={40} />
        </div>
      )}
    </div>
  );
}