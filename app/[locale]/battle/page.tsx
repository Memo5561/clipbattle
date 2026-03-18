"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {
  RefreshCw,
  Trophy,
  Volume2,
  VolumeX,
  Check,
  ArrowRight
} from "lucide-react";

type Clip = {
  id: string;
  title: string;
  game: string;
  video_url: string;
  votes: number;
  username: string | null;
};

export default function BattlePage() {
  const t = useTranslations("Battle");

  const [clips, setClips] = useState<Clip[]>([]);
  const [clipA, setClipA] = useState<Clip | null>(null);
  const [clipB, setClipB] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const [mutedA, setMutedA] = useState(true);
  const [mutedB, setMutedB] = useState(true);

  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);

  const fetchBattle = async () => {
    setLoading(true);

    const {data} = await supabase
      .from("clips")
      .select("*")
      .order("created_at", {ascending: false});

    if (!data || data.length < 2) {
      setLoading(false);
      return;
    }

    const loadedClips = data as Clip[];
    setClips(loadedClips);
    generateBattlePair(loadedClips);
    setLoading(false);
  };

  const generateBattlePair = (list: Clip[]) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setClipA(shuffled[0]);
    setClipB(shuffled[1]);
    setWinnerId(null);
  };

  useEffect(() => {
    fetchBattle();
  }, []);

  const handleVote = async (winner: Clip) => {
    if (voting) return;

    setVoting(true);
    setWinnerId(winner.id);

    await supabase
      .from("clips")
      .update({votes: winner.votes + 1})
      .eq("id", winner.id);

    setTimeout(() => {
      generateBattlePair(clips);
      setVoting(false);
    }, 900);
  };

  return (
    <ProtectedPage>
      <div className="text-white">
        {loading || !clipA || !clipB ? (
          <div className="flex h-[60vh] items-center justify-center text-zinc-400">
            {t("loading")}
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-4">
            
            {/* HEADER */}
            <section className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900/80 px-4 py-3">
              <h1 className="text-xl font-bold">{t("title")}</h1>

              <button
                onClick={() => generateBattlePair(clips)}
                className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2"
              >
                <RefreshCw size={16} />
                {t("newRound")}
              </button>
            </section>

            <SwipeCard
              clip={clipA}
              videoRef={videoRefA}
              muted={mutedA}
              onToggleMute={() => setMutedA(!mutedA)}
              onVote={() => handleVote(clipA)}
              isWinner={winnerId === clipA.id}
            />

            <div className="text-center text-zinc-500">VS</div>

            <SwipeCard
              clip={clipB}
              videoRef={videoRefB}
              muted={mutedB}
              onToggleMute={() => setMutedB(!mutedB)}
              onVote={() => handleVote(clipB)}
              isWinner={winnerId === clipB.id}
            />
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}

function SwipeCard({
  clip,
  videoRef,
  muted,
  onToggleMute,
  onVote,
  isWinner
}: any) {
  const [dragX, setDragX] = useState(0);
  const startX = useRef<number | null>(null);

  const threshold = 100;
  const progress = Math.min(dragX / threshold, 1);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-zinc-800"
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
      <video
        ref={videoRef}
        src={clip.video_url}
        autoPlay
        loop
        muted={muted}
        className="w-full aspect-video object-cover"
      />

      {/* SMOOTH SWIPE OVERLAY */}
      <div
        className="absolute inset-y-0 left-0 bg-green-500/30"
        style={{
          width: "100%",
          transform: `scaleX(${progress})`,
          transformOrigin: "left"
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />

      {/* CONTENT */}
      <div className="absolute bottom-4 left-4">
        <h2 className="text-xl font-bold">{clip.title}</h2>
        <p className="text-sm text-zinc-400">{clip.username}</p>
      </div>

      {/* MUTE */}
      <button
        onClick={onToggleMute}
        className="absolute top-3 left-3 bg-black/60 p-2 rounded-full"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* WINNER */}
      {isWinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
          <Trophy />
        </div>
      )}
    </div>
  );
}