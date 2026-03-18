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
    return <div className="text-center text-zinc-400 mt-20">Loading...</div>;
  }

  return (
    <ProtectedPage>
      <div className="text-white mx-auto max-w-5xl space-y-2">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 rounded-3xl bg-zinc-900 border border-zinc-800">
          <h1 className="text-xl font-bold">Battle</h1>

          <button
            onClick={() => generatePair(clips)}
            className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-xl"
          >
            <RefreshCw size={16} />
            Neue Runde
          </button>
        </div>

        {/* CLIP A */}
        <SwipeCard
          clip={clipA}
          videoRef={videoRefA}
          muted={mutedA}
          toggleMute={() => setMutedA(!mutedA)}
          onVote={() => vote(clipA)}
          isWinner={winnerId === clipA.id}
        />

        <div className="text-center text-xs text-zinc-600">VS</div>

        {/* CLIP B */}
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
}: any) {
  const [dragX, setDragX] = useState(0);
  const startX = useRef<number | null>(null);

  const threshold = 100;
  const progress = Math.min(dragX / threshold, 1);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl"
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchMove={(e) => {
        if (!startX.current) return;
        const diff = e.touches[0].clientX - startX.current;
        setDragX(diff > 0 ? diff : 0);
      }}
      onTouchEnd={() => {
        if (dragX > threshold) onVote();
        setDragX(0);
        startX.current = null;
      }}
      style={{
        transform: `translateX(${dragX}px)`
      }}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={clip.video_url}
        autoPlay
        loop
        muted={muted}
        playsInline
        className="h-[70vh] w-full object-cover"
      />

      {/* SMOOTH GREEN SWIPE */}
      <div
        className="absolute inset-y-0 left-0 bg-emerald-500/30"
        style={{
          width: "100%",
          transform: `scaleX(${progress})`,
          transformOrigin: "left"
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* TEXT */}
      <div className="absolute bottom-5 left-5">
        <h2 className="text-2xl font-bold">{clip.title}</h2>
        <p className="text-sm text-zinc-400">{clip.username}</p>
      </div>

      {/* MUTE */}
      <button
        onClick={toggleMute}
        className="absolute top-4 left-4 bg-black/60 p-2 rounded-full"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* WINNER */}
      {isWinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
          <Trophy size={40} />
        </div>
      )}
    </div>
  );
}