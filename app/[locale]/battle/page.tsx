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
    }, 1100);
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
      <div className="text-white">
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
          <div className="mx-auto max-w-5xl space-y-4">
            <section className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs text-zinc-500">{t("badge")}</p>
                <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
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

            <NextLevelSwipeCard
              clip={clipA}
              videoRef={videoRefA}
              muted={mutedA}
              onToggleMute={() => toggleMute(videoRefA, mutedA, setMutedA)}
              onVote={() => handleVote(clipA)}
              isWinner={winnerId === clipA.id}
              isLoser={!!winnerId && winnerId !== clipA.id}
              voting={voting}
              color="from-purple-500 to-fuchsia-500"
              t={t}
            />

            <div className="flex justify-center">
              <div className="rounded-full border border-white/15 bg-black/70 px-5 py-3 text-sm font-bold tracking-[0.3em] text-white shadow-2xl backdrop-blur">
                VS
              </div>
            </div>

            <NextLevelSwipeCard
              clip={clipB}
              videoRef={videoRefB}
              muted={mutedB}
              onToggleMute={() => toggleMute(videoRefB, mutedB, setMutedB)}
              onVote={() => handleVote(clipB)}
              isWinner={winnerId === clipB.id}
              isLoser={!!winnerId && winnerId !== clipB.id}
              voting={voting}
              color="from-blue-500 to-cyan-500"
              t={t}
            />

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
                {t("swipeHint")}
              </p>
            </section>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}

type SwipeCardProps = {
  clip: Clip;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  muted: boolean;
  onToggleMute: () => void;
  onVote: () => void;
  isWinner: boolean;
  isLoser: boolean;
  voting: boolean;
  color: string;
  t: (key: string, values?: Record<string, string | number>) => string;
};

function NextLevelSwipeCard({
  clip,
  videoRef,
  muted,
  onToggleMute,
  onVote,
  isWinner,
  isLoser,
  voting,
  color,
  t
}: SwipeCardProps) {
  const username = clip.username || t("unknownUser");

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [voteBurst, setVoteBurst] = useState(false);
  const startXRef = useRef<number | null>(null);

  const threshold = 100;
  const progress = Math.min(dragX / threshold, 1);
  const reached = dragX >= threshold;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (voting) return;
    startXRef.current = e.touches[0].clientX;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null || voting) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;

    setDragX(diff > 0 ? diff : 0);
  };

  const handleTouchEnd = () => {
    if (voting) return;

    if (dragX >= threshold) {
      setVoteBurst(true);
      setDragX(220);
      setDragging(false);
      startXRef.current = null;

      setTimeout(() => {
        onVote();
        setVoteBurst(false);
        setDragX(0);
      }, 180);
      return;
    }

    setDragX(0);
    setDragging(false);
    startXRef.current = null;
  };

  return (
    <article
      className={`relative overflow-hidden rounded-[2rem] border bg-zinc-950 shadow-2xl transition-all duration-300 ${
        isWinner
          ? "border-emerald-400/40 ring-2 ring-emerald-400/20"
          : "border-zinc-800"
      } ${isLoser ? "opacity-60" : "opacity-100"}`}
    >
      <div
        className="transition-transform duration-150 ease-out"
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX * 0.03}deg) scale(${dragging ? 1.015 : 1})`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative">
          <video
            ref={videoRef}
            src={clip.video_url}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="aspect-video w-full object-cover bg-black"
          />

          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 bg-emerald-500/30 will-change-transform"
            style={{
              width: "100%",
              transform: `scaleX(${progress})`,
              transformOrigin: "left",
              transition: dragging
                ? "none"
                : "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)"
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 z-10 transition"
            style={{
              boxShadow: reached
                ? "inset 0 0 0 9999px rgba(16,185,129,0.12)"
                : "none"
            }}
          />

          <div className="pointer-events-none absolute left-4 top-1/2 z-20 -translate-y-1/2">
            <div
              className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-xl transition-all duration-150"
              style={{
                opacity: progress > 0.08 ? 1 : 0,
                transform: `scale(${0.88 + progress * 0.22})`
              }}
            >
              {reached ? <Check size={16} /> : <ArrowRight size={16} />}
              {t("voteBadge")}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 right-4 z-20">
            <div
              className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur transition-all duration-150"
              style={{
                opacity: progress > 0.12 ? 0 : 1,
                transform: `translateX(${-progress * 20}px)`
              }}
            >
              → {t("swipeToVote")}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            className="absolute left-3 top-3 z-20 rounded-full bg-black/65 p-2 text-white backdrop-blur transition hover:bg-black/85"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {voteBurst && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div className="rounded-full border border-emerald-300/30 bg-emerald-500/25 px-6 py-4 text-lg font-bold text-emerald-100 shadow-2xl backdrop-blur-md animate-pulse">
                <span className="inline-flex items-center gap-2">
                  <Check size={20} />
                  {t("voteBadge")}
                </span>
              </div>
            </div>
          )}

          {isWinner && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/15 backdrop-blur-[1px]">
              <div className="rounded-full border border-emerald-300/30 bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-200 shadow-2xl sm:text-base">
                <span className="inline-flex items-center gap-2">
                  <Trophy size={18} />
                  {t("winner")}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-2xl font-bold text-white">
                {clip.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-300">{clip.game}</p>
            </div>

            <div
              className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${color}`}
            >
              {clip.votes || 0} {t("votes")}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-lg">
            <p className="text-sm text-zinc-300">
              {t("postedBy")}:{" "}
              <span className="font-semibold text-white">{username}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onVote}
            disabled={voting}
            className={`w-full rounded-2xl bg-gradient-to-r px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60 ${color}`}
          >
            {clip.username ? t("voteFor", {username}) : t("voteForClip")}
          </button>
        </div>
      </div>
    </article>
  );
}