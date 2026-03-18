"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {RefreshCw, Trophy, Volume2, VolumeX} from "lucide-react";

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

    const {data, error} = await supabase
      .from("clips")
      .select("*")
      .order("created_at", {ascending: false});

    if (error) {
      console.error("Fehler beim Laden der Clips:", error.message);
      setLoading(false);
      return;
    }

    if (!data || data.length < 2) {
      setClips([]);
      setClipA(null);
      setClipB(null);
      setLoading(false);
      return;
    }

    const loadedClips = data as Clip[];
    setClips(loadedClips);
    generateBattlePair(loadedClips);
    setLoading(false);
  };

  const generateBattlePair = (list: Clip[]) => {
    if (list.length < 2) {
      setClipA(null);
      setClipB(null);
      return;
    }

    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const first = shuffled[0];
    const second = shuffled.find((clip) => clip.id !== first.id) || shuffled[1];

    setClipA(first);
    setClipB(second);
    setWinnerId(null);
    setMutedA(true);
    setMutedB(true);
  };

  useEffect(() => {
    fetchBattle();
  }, []);

  useEffect(() => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (videoA) {
      videoA.muted = mutedA;
      videoA.play().catch(() => {});
    }

    if (videoB) {
      videoB.muted = mutedB;
      videoB.play().catch(() => {});
    }
  }, [clipA, clipB, mutedA, mutedB]);

  const totalVotes = useMemo(() => {
    return (clipA?.votes || 0) + (clipB?.votes || 0);
  }, [clipA, clipB]);

  const percentA = useMemo(() => {
    if (!clipA || !clipB) return 50;
    if (totalVotes === 0) return 50;
    return Math.round((clipA.votes / totalVotes) * 100);
  }, [clipA, clipB, totalVotes]);

  const handleVote = async (winner: Clip) => {
    if (voting) return;

    setVoting(true);
    setWinnerId(winner.id);

    const newVotes = (winner.votes || 0) + 1;

    const {error} = await supabase
      .from("clips")
      .update({votes: newVotes})
      .eq("id", winner.id);

    if (error) {
      alert("Fehler beim Voten: " + error.message);
      setVoting(false);
      setWinnerId(null);
      return;
    }

    const updatedClips = clips.map((clip) =>
      clip.id === winner.id ? {...clip, votes: newVotes} : clip
    );

    setClips(updatedClips);

    if (clipA?.id === winner.id) {
      setClipA({...clipA, votes: newVotes});
    }

    if (clipB?.id === winner.id) {
      setClipB({...clipB, votes: newVotes});
    }

    setTimeout(() => {
      generateBattlePair(updatedClips);
      setVoting(false);
    }, 1400);
  };

  const toggleMute = (
    ref: React.RefObject<HTMLVideoElement | null>,
    muted: boolean,
    setMuted: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const video = ref.current;
    if (!video) return;

    video.muted = !muted;
    setMuted(!muted);
    video.play().catch(() => {});
  };

  return (
    <ProtectedPage>
      <div className="min-h-[calc(100vh-7rem)] text-white">
        {loading ? (
          <section className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center">
            <p className="text-zinc-400">{t("loading")}</p>
          </section>
        ) : !clipA || !clipB ? (
          <section className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center">
            <h1 className="mb-3 text-3xl font-bold">{t("notEnough")}</h1>
            <p className="max-w-xl text-zinc-400">{t("notEnoughText")}</p>
          </section>
        ) : (
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Top bar */}
            <section className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs text-zinc-500">{t("badge")}</p>
                <h1 className="text-lg font-bold sm:text-xl">{t("title")}</h1>
              </div>

              <button
                onClick={() => generateBattlePair(clips)}
                disabled={voting}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
              >
                <RefreshCw size={16} />
                {t("newRound")}
              </button>
            </section>

            {/* Split screen */}
            <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950">
              <div className="grid min-h-[72vh] grid-cols-2 sm:min-h-[78vh]">
                <SplitSide
                  clip={clipA}
                  videoRef={videoRefA}
                  muted={mutedA}
                  onToggleMute={() => toggleMute(videoRefA, mutedA, setMutedA)}
                  onVote={() => handleVote(clipA)}
                  isWinner={winnerId === clipA.id}
                  isLoser={!!winnerId && winnerId !== clipA.id}
                  align="left"
                  accent="from-purple-500/35 to-blue-500/10"
                  voting={voting}
                  t={t}
                />

                <SplitSide
                  clip={clipB}
                  videoRef={videoRefB}
                  muted={mutedB}
                  onToggleMute={() => toggleMute(videoRefB, mutedB, setMutedB)}
                  onVote={() => handleVote(clipB)}
                  isWinner={winnerId === clipB.id}
                  isLoser={!!winnerId && winnerId !== clipB.id}
                  align="right"
                  accent="from-blue-500/35 to-cyan-500/10"
                  voting={voting}
                  t={t}
                />
              </div>

              {/* Middle divider */}
              <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-white/15" />

              {/* VS badge */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-full border border-white/20 bg-black/70 px-4 py-3 text-sm font-bold tracking-[0.3em] text-white shadow-2xl backdrop-blur">
                  VS
                </div>
              </div>
            </section>

            {/* Bottom info */}
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between text-xs text-zinc-400 sm:text-sm">
                <span>{clipA.username || t("unknownUser")}</span>
                <span>{clipB.username || t("unknownUser")}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{width: `${percentA}%`}}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 sm:text-sm">
                <span>
                  {clipA.votes || 0} {t("votes")}
                </span>
                <span>
                  {clipB.votes || 0} {t("votes")}
                </span>
              </div>

              <p className="mt-4 text-center text-xs text-zinc-500 sm:text-sm">
                {t("subtitle")}
              </p>
            </section>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}

type SplitSideProps = {
  clip: Clip;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  muted: boolean;
  onToggleMute: () => void;
  onVote: () => void;
  isWinner: boolean;
  isLoser: boolean;
  align: "left" | "right";
  accent: string;
  voting: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
};

function SplitSide({
  clip,
  videoRef,
  muted,
  onToggleMute,
  onVote,
  isWinner,
  isLoser,
  align,
  accent,
  voting,
  t
}: SplitSideProps) {
  const username = clip.username || t("unknownUser");

  return (
    <button
      type="button"
      onClick={onVote}
      disabled={voting}
      className={`group relative h-full w-full overflow-hidden text-left transition duration-300 ${
        isWinner ? "scale-[1.01]" : ""
      } ${isLoser ? "opacity-60" : "opacity-100"} disabled:cursor-default`}
    >
      <video
        ref={videoRef}
        src={clip.video_url}
        autoPlay
        loop
        muted={muted}
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className={`absolute inset-0 bg-gradient-to-b ${accent}`} />
      <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" />

      {/* Winner overlay */}
      {isWinner && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/15 backdrop-blur-[2px]">
          <div className="rounded-full border border-emerald-300/30 bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-200 shadow-2xl sm:text-base">
            <span className="inline-flex items-center gap-2">
              <Trophy size={18} />
              {t("winner")}
            </span>
          </div>
        </div>
      )}

      {/* Mute */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        className={`absolute top-3 z-30 rounded-full bg-black/65 p-2 text-white backdrop-blur transition hover:bg-black/85 ${
          align === "left" ? "left-3" : "right-3"
        }`}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Tap hint */}
      <div
        className={`absolute top-3 z-20 ${
          align === "left" ? "right-3 text-right" : "left-3 text-left"
        }`}
      >
        <div className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur sm:text-xs">
          {clip.username ? t("voteFor", {username}) : t("voteForClip")}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4">
        <div className="rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md">
          <h2 className="line-clamp-2 text-sm font-bold text-white sm:text-lg">
            {clip.title}
          </h2>

          <p className="mt-1 line-clamp-1 text-xs text-zinc-300 sm:text-sm">
            {clip.game}
          </p>

          <div className="mt-2 flex flex-col gap-1 text-[11px] text-zinc-300 sm:text-xs">
            <span>
              {t("postedBy")}: {username}
            </span>
            <span>
              {clip.votes || 0} {t("votes")}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}