"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

import {
  Volume2,
  VolumeX,
  Trophy,
  Swords,
  RefreshCw,
  Pause,
  Play
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
  const [pausedA, setPausedA] = useState(false);
  const [pausedB, setPausedB] = useState(false);

  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);

  const fetchBattle = async () => {
    setLoading(true);

    const {data, error} = await supabase
      .from("clips")
      .select("*")
      .order("created_at", {ascending: false});

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    if (!data || data.length < 2) {
      setClipA(null);
      setClipB(null);
      setLoading(false);
      return;
    }

    const list = data as Clip[];
    setClips(list);
    generateBattlePair(list);
    setLoading(false);
  };

  const generateBattlePair = (list: Clip[]) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const first = shuffled[0];
    const second = shuffled.find((c) => c.id !== first.id) || shuffled[1];

    setClipA(first);
    setClipB(second);
    setWinnerId(null);
  };

  useEffect(() => {
    fetchBattle();
  }, []);

  const totalVotes = (clipA?.votes || 0) + (clipB?.votes || 0);

  const percentA =
    totalVotes === 0 ? 50 : Math.round(((clipA?.votes || 0) / totalVotes) * 100);

  const toggleMute = (ref: any, muted: boolean, setMuted: any) => {
    const video = ref.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const togglePlayPause = (ref: any, paused: boolean, setPaused: any) => {
    const video = ref.current;
    if (!video) return;

    if (paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const handleVote = async (winner: Clip) => {
    if (voting) return;

    setVoting(true);
    setWinnerId(winner.id);

    const newVotes = winner.votes + 1;

    await supabase
      .from("clips")
      .update({votes: newVotes})
      .eq("id", winner.id);

    setTimeout(() => {
      generateBattlePair(clips);
      setVoting(false);
    }, 1200);
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen text-white">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Header */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8">
            <div className="mb-3 flex items-center gap-2 text-zinc-300">
              <Swords size={16} />
              {t("badge")}
            </div>

            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-zinc-400">{t("subtitle")}</p>

            <button
              onClick={() => generateBattlePair(clips)}
              className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
            >
              <RefreshCw size={16} />
              {t("newRound")}
            </button>
          </section>

          {/* Not enough clips */}
          {!clipA || !clipB ? (
            <div className="text-center text-zinc-400">
              {t("notEnough")}
            </div>
          ) : (
            <>
              {/* VS */}
              <div className="text-center font-bold text-xl">VS</div>

              <div className="grid gap-6 lg:grid-cols-2">

                {/* Clip A */}
                <BattleCard
                  clip={clipA}
                  videoRef={videoRefA}
                  muted={mutedA}
                  paused={pausedA}
                  onToggleMute={() =>
                    toggleMute(videoRefA, mutedA, setMutedA)
                  }
                  onTogglePlayPause={() =>
                    togglePlayPause(videoRefA, pausedA, setPausedA)
                  }
                  onVote={() => handleVote(clipA)}
                  isWinner={winnerId === clipA.id}
                  voting={voting}
                  t={t}
                />

                {/* Clip B */}
                <BattleCard
                  clip={clipB}
                  videoRef={videoRefB}
                  muted={mutedB}
                  paused={pausedB}
                  onToggleMute={() =>
                    toggleMute(videoRefB, mutedB, setMutedB)
                  }
                  onTogglePlayPause={() =>
                    togglePlayPause(videoRefB, pausedB, setPausedB)
                  }
                  onVote={() => handleVote(clipB)}
                  isWinner={winnerId === clipB.id}
                  voting={voting}
                  t={t}
                />
              </div>

              {/* Votes bar */}
              <div className="mt-6 h-3 w-full bg-zinc-800 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  style={{width: `${percentA}%`}}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}

function BattleCard({
  clip,
  videoRef,
  muted,
  paused,
  onToggleMute,
  onTogglePlayPause,
  onVote,
  isWinner,
  voting,
  t
}: any) {
  return (
    <div className="rounded-3xl border border-zinc-800 p-5 bg-zinc-900">
      <video
        ref={videoRef}
        src={clip.video_url}
        autoPlay
        muted={muted}
        loop
        className="w-full rounded-xl"
        onClick={onTogglePlayPause}
      />

      <div className="mt-4">
        <h2 className="font-bold">{clip.title}</h2>
        <p className="text-zinc-400">{clip.game}</p>

        <p className="text-sm text-zinc-500">
          {t("postedBy")}: {clip.username || t("unknownUser")}
        </p>

        <p className="text-sm text-zinc-500">
          {clip.votes} {t("votes")}
        </p>

        {isWinner && (
          <div className="text-green-400 flex items-center gap-2 mt-2">
            <Trophy size={16} /> {t("winner")}
          </div>
        )}

        <button
          onClick={onVote}
          disabled={voting}
          className="mt-4 w-full bg-white text-black py-2 rounded-xl"
        >
          {t("voteForClip")}
        </button>
      </div>
    </div>
  );
}