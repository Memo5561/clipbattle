"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Swords, Trophy, ArrowRight, Crown, Volume2, VolumeX } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Clip = {
  id: string;
  title: string;
  game: string;
  video_url?: string | null;
  votes?: number;
};

export default function BattlePage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [pair, setPair] = useState<[Clip, Clip] | null>(null);
  const [winnerText, setWinnerText] = useState("");
  const [leftMuted, setLeftMuted] = useState(true);
  const [rightMuted, setRightMuted] = useState(true);

  const leftVideoRef = useRef<HTMLVideoElement | null>(null);
  const rightVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    loadClips();
  }, []);

  const loadClips = async () => {
    const { data, error } = await supabase.from("clips").select("*");

    if (error) {
      console.error("Fehler beim Laden der Clips:", error.message);
      return;
    }

    if (data) {
      setClips(data);
      generateBattle(data);
    }
  };

  const generateBattle = (clipList: Clip[]) => {
    if (clipList.length < 2) {
      setPair(null);
      return;
    }

    const randomIndexes = new Set<number>();

    while (randomIndexes.size < 2) {
      randomIndexes.add(Math.floor(Math.random() * clipList.length));
    }

    const [firstIndex, secondIndex] = Array.from(randomIndexes);
    setPair([clipList[firstIndex], clipList[secondIndex]]);
    setWinnerText("");
    setLeftMuted(true);
    setRightMuted(true);
  };

  const handleVote = async (winner: Clip) => {
    const newVotes = (winner.votes || 0) + 1;

    const { error } = await supabase
      .from("clips")
      .update({ votes: newVotes })
      .eq("id", winner.id);

    if (error) {
      alert("Fehler beim Voten: " + error.message);
      return;
    }

    const updatedClips = clips.map((clip) =>
      clip.id === winner.id ? { ...clip, votes: newVotes } : clip
    );

    setClips(updatedClips);
    setWinnerText(`🏆 Gewinner: ${winner.title}`);
  };

  const handleNextRound = () => {
    generateBattle(clips);
  };

  const toggleVideo = (
    ref: React.RefObject<HTMLVideoElement | null>,
    muted: boolean,
    setMuted: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const video = ref.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }

    video.muted = !muted;
    setMuted(!muted);
  };

  const toggleOnlySound = (
    ref: React.RefObject<HTMLVideoElement | null>,
    muted: boolean,
    setMuted: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const video = ref.current;
    if (!video) return;

    video.muted = !muted;
    setMuted(!muted);

    if (video.paused) {
      video.play();
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Swords /> ClipBattle Arena
        </h1>

        <Link
          href="/"
          className="inline-block rounded-xl bg-white px-4 py-2 text-black"
        >
          Zurück zur Startseite
        </Link>
      </div>

      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-3 flex items-center gap-2 text-zinc-400">
          <Trophy size={18} />
          Battle Mode
        </div>

        <h2 className="mb-3 text-4xl font-bold">
          Lass zwei Clips direkt gegeneinander antreten
        </h2>

        <p className="max-w-2xl text-zinc-400">
          Stimme für den besseren Clip ab. Der Gewinner bekommt einen
          zusätzlichen Vote und steigt im Ranking weiter nach oben.
        </p>
      </div>

      {!pair ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="mb-2 text-xl font-semibold">
            Du brauchst mindestens 2 Clips für ein Battle.
          </p>
          <p className="mb-6 text-zinc-400">
            Lade zuerst mindestens zwei Clips hoch, damit ein Battle gestartet
            werden kann.
          </p>

          <Link
            href="/upload"
            className="inline-block rounded-xl bg-white px-5 py-3 text-black"
          >
            Jetzt Clips hochladen
          </Link>
        </div>
      ) : (
        <>
          {winnerText && (
            <div className="mb-8 flex items-center gap-2 rounded-2xl border border-green-500/30 bg-green-600/20 p-4 text-green-300">
              <Crown size={18} />
              {winnerText}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="relative mb-6 overflow-hidden rounded-2xl bg-zinc-800">
                {pair[0].video_url ? (
                  <>
                    <video
                      ref={leftVideoRef}
                      src={pair[0].video_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onClick={() =>
                        toggleVideo(leftVideoRef, leftMuted, setLeftMuted)
                      }
                      className="h-72 w-full cursor-pointer object-cover rounded-2xl"
                    />

                    <button
                      onClick={() =>
                        toggleOnlySound(leftVideoRef, leftMuted, setLeftMuted)
                      }
                      className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur"
                    >
                      {leftMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </>
                ) : (
                  <div className="flex h-72 items-center justify-center text-6xl">
                    🎮
                  </div>
                )}
              </div>

              <p className="mb-2 text-sm text-zinc-500">Clip A</p>
              <h3 className="mb-2 text-2xl font-bold">{pair[0].title}</h3>
              <p className="mb-2 text-zinc-400">{pair[0].game}</p>
              <p className="mb-6 text-zinc-500">Likes: {pair[0].votes || 0}</p>

              <button
                onClick={() => handleVote(pair[0])}
                className="mt-auto rounded-xl bg-white py-3 font-semibold text-black transition hover:bg-zinc-200"
              >
                Vote für Clip A
              </button>
            </div>

            <div className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="relative mb-6 overflow-hidden rounded-2xl bg-zinc-800">
                {pair[1].video_url ? (
                  <>
                    <video
                      ref={rightVideoRef}
                      src={pair[1].video_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onClick={() =>
                        toggleVideo(rightVideoRef, rightMuted, setRightMuted)
                      }
                      className="h-72 w-full cursor-pointer object-cover rounded-2xl"
                    />

                    <button
                      onClick={() =>
                        toggleOnlySound(rightVideoRef, rightMuted, setRightMuted)
                      }
                      className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur"
                    >
                      {rightMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </>
                ) : (
                  <div className="flex h-72 items-center justify-center text-6xl">
                    🕹️
                  </div>
                )}
              </div>

              <p className="mb-2 text-sm text-zinc-500">Clip B</p>
              <h3 className="mb-2 text-2xl font-bold">{pair[1].title}</h3>
              <p className="mb-2 text-zinc-400">{pair[1].game}</p>
              <p className="mb-6 text-zinc-500">Likes: {pair[1].votes || 0}</p>

              <button
                onClick={() => handleVote(pair[1])}
                className="mt-auto rounded-xl bg-white py-3 font-semibold text-black transition hover:bg-zinc-200"
              >
                Vote für Clip B
              </button>
            </div>
          </div>

          <div className="my-8 flex justify-center">
            <div className="rounded-full bg-zinc-800 px-6 py-3 font-bold tracking-widest">
              VS
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleNextRound}
              className="flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-3 transition hover:bg-zinc-700"
            >
              Nächste Runde <ArrowRight size={18} />
            </button>

            <Link
              href="/leaderboard"
              className="inline-block rounded-xl bg-white px-5 py-3 text-black"
            >
              Zum Leaderboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}