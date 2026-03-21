"use client";

import {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
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
  const t = useTranslations("Battle");

  const [clips, setClips] = useState<Clip[]>([]);
  const [clipA, setClipA] = useState<Clip | null>(null);
  const [clipB, setClipB] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const generatePair = (list: Clip[]) => {
    if (!list || list.length < 2) return;

    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setClipA(shuffled[0]);
    setClipB(shuffled[1]);
    setWinnerId(null);
  };

  const fetchClips = async () => {
    setLoading(true);

    const {data} = await supabase
      .from("clips")
      .select("*")
      .order("created_at", {ascending: false});

    const loaded = (data as Clip[]) || [];
    setClips(loaded);
    generatePair(loaded);
    setLoading(false);
  };

  useEffect(() => {
    fetchClips();
  }, []);

  const vote = async (clip: Clip) => {
    if (voting) return;

    setVoting(true);
    setWinnerId(clip.id);

    const newVotes = clip.votes + 1;

    await supabase
      .from("clips")
      .update({votes: newVotes})
      .eq("id", clip.id);

    setTimeout(() => {
      generatePair(clips);
      setVoting(false);
    }, 900);
  };

  if (loading || !clipA || !clipB) {
    return (
      <ProtectedPage>
        <div className="flex h-screen items-center justify-center text-white">
          Loading...
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="relative min-h-screen bg-black text-white">

        {/* HEADER */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
          <span className="text-sm font-semibold">⚔️ Battle Arena</span>

          <button
            onClick={() => generatePair(clips)}
            className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
          >
            <RefreshCw size={14} />
            Neu
          </button>
        </div>

        {/* CLIP A */}
        <BattleCard
          clip={clipA}
          onVote={() => vote(clipA)}
          isWinner={winnerId === clipA.id}
        />

        {/* VS */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
          <div className="text-6xl font-black text-white/10 tracking-widest">
            VS
          </div>
        </div>

        {/* CLIP B */}
        <BattleCard
          clip={clipB}
          onVote={() => vote(clipB)}
          isWinner={winnerId === clipB.id}
        />
      </div>
    </ProtectedPage>
  );
}

function BattleCard({
  clip,
  onVote,
  isWinner
}: {
  clip: Clip;
  onVote: () => void;
  isWinner: boolean;
}) {
  const [muted, setMuted] = useState(true);
  const [drag, setDrag] = useState(0);

  const startX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX.current) return;
    const diff = e.touches[0].clientX - startX.current;
    if (diff > 0) setDrag(diff);
  };

  const handleTouchEnd = () => {
    if (drag > 120) onVote();
    setDrag(0);
    startX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-screen overflow-hidden"
      style={{
        transform: `translateX(${drag}px) rotate(${drag * 0.05}deg)`
      }}
    >
      {/* VIDEO */}
      <video
        src={clip.video_url}
        autoPlay
        loop
        muted={muted}
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/90" />

      {/* INFO */}
      <div className="absolute bottom-10 left-5 z-10">
        <h2 className="text-3xl font-black">{clip.title}</h2>
        <p className="text-zinc-400">@{clip.username || "User"}</p>
      </div>

      {/* MUTE */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute top-6 right-5 z-10 bg-black/50 p-3 rounded-full"
      >
        {muted ? <VolumeX /> : <Volume2 />}
      </button>

      {/* WINNER */}
      {isWinner && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <Trophy className="h-16 w-16 text-yellow-400 animate-bounce" />
            <span className="text-xl font-bold">WINNER</span>
          </div>
        </div>
      )}

      {/* SWIPE HINT */}
      <div className="absolute bottom-4 right-4 text-xs text-zinc-400">
        👉 Swipe to vote
      </div>
    </div>
  );
}