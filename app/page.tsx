"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Swords,
  Play,
  Heart,
  Crown,
  Filter,
  Trophy,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

type Clip = {
  id: string;
  title: string;
  game: string;
  video_url?: string | null;
  votes?: number;
  user_id?: string | null;
};

export default function Home() {
  const [votesA, setVotesA] = useState(120);
  const [votesB, setVotesB] = useState(95);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedGame, setSelectedGame] = useState("Alle");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadEverything = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (user) {
        setCurrentUserId(user.id);
        setUserEmail(user.email ?? null);
      } else {
        setCurrentUserId(null);
        setUserEmail(null);
      }

      const { data, error } = await supabase
        .from("clips")
        .select("*")
        .order("votes", { ascending: false });

      if (error) {
        console.error("Fehler beim Laden:", error.message);
        return;
      }

      if (data) {
        setClips(data);
      }
    };

    loadEverything();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;

      if (user) {
        setCurrentUserId(user.id);
        setUserEmail(user.email ?? null);
      } else {
        setCurrentUserId(null);
        setUserEmail(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const games = useMemo(() => {
    const uniqueGames = Array.from(
      new Set(clips.map((clip) => clip.game).filter(Boolean))
    );
    return ["Alle", ...uniqueGames];
  }, [clips]);

  const filteredClips = useMemo(() => {
    if (selectedGame === "Alle") return clips;
    return clips.filter((clip) => clip.game === selectedGame);
  }, [clips, selectedGame]);

  const total = votesA + votesB;
  const percentA = Math.round((votesA / total) * 100);
  const percentB = 100 - percentA;

  const handleLike = async (id: string, currentVotes: number) => {
    const newVotes = currentVotes + 1;

    const { error } = await supabase
      .from("clips")
      .update({ votes: newVotes })
      .eq("id", id);

    if (error) {
      alert("Fehler beim Liken: " + error.message);
      return;
    }

    setClips((prev) =>
      [...prev]
        .map((clip) =>
          clip.id === id ? { ...clip, votes: newVotes } : clip
        )
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("clips").delete().eq("id", id);

    if (error) {
      alert("Fehler beim Löschen: " + error.message);
      return;
    }

    setClips((prev) => prev.filter((clip) => clip.id !== id));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout Fehler: " + error.message);
      return;
    }

    alert("Erfolgreich ausgeloggt");
    window.location.reload();
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div>
          {userEmail ? (
            <>
              <p className="text-sm text-zinc-400">Eingeloggt als</p>
              <p className="font-semibold">{userEmail}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-400">Status</p>
              <p className="font-semibold">Nicht eingeloggt</p>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {!userEmail ? (
            <Link
              href="/auth"
              className="rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200"
            >
              Login / Registrieren
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-400"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </div>

      <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8 md:p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300">
          <Trophy size={16} />
          Gaming Clips • Battles • Leaderboard
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Lass Gamer ihre besten Clips posten und gegeneinander antreten.
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          ClipBattle ist deine Plattform für virale Gaming-Momente,
          Community-Votings, direkte Battles und ein Ranking der besten Clips.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/upload"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Clip hochladen
          </Link>

          <Link
            href="/battle"
            className="rounded-xl bg-zinc-800 px-5 py-3 font-medium text-white transition hover:bg-zinc-700"
          >
            Battle starten
          </Link>

          <Link
            href="/leaderboard"
            className="rounded-xl bg-zinc-800 px-5 py-3 font-medium text-white transition hover:bg-zinc-700"
          >
            Leaderboard ansehen
          </Link>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <Swords /> Live Battle Demo
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setVotesA(votesA + 1)}
            className="cursor-pointer rounded-2xl bg-zinc-800 p-4 transition hover:bg-zinc-700"
          >
            <div className="mb-4 flex justify-center">
              <Play />
            </div>
            <p className="text-center font-medium">Clip A</p>
            <p className="text-center text-zinc-400">{votesA} Votes</p>
          </div>

          <div
            onClick={() => setVotesB(votesB + 1)}
            className="cursor-pointer rounded-2xl bg-zinc-800 p-4 transition hover:bg-zinc-700"
          >
            <div className="mb-4 flex justify-center">
              <Play />
            </div>
            <p className="text-center font-medium">Clip B</p>
            <p className="text-center text-zinc-400">{votesB} Votes</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-1 flex justify-between text-sm text-zinc-400">
            <span>{percentA}%</span>
            <span>{percentB}%</span>
          </div>

          <div className="h-3 w-full rounded-full bg-zinc-800">
            <div
              className="h-3 rounded-full bg-green-500"
              style={{ width: `${percentA}%` }}
            />
          </div>
        </div>
      </motion.section>

      <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <Flame /> Leaderboard Preview
        </h2>

        <div className="space-y-3">
          {[
            { name: "Player1", points: 1200 },
            { name: "Player2", points: 1100 },
            { name: "Player3", points: 980 },
          ].map((player, i) => (
            <div
              key={i}
              className="flex justify-between rounded-2xl bg-zinc-800 p-4"
            >
              <span>
                #{i + 1} {player.name}
              </span>
              <span>{player.points} pts</span>
            </div>
          ))}
        </div>
      </section>

      {clips.length > 0 && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Crown size={20} /> Clips Feed
            </h2>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-zinc-400" />
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="rounded-xl bg-zinc-800 px-4 py-2 text-white outline-none"
              >
                {games.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredClips.length === 0 ? (
            <div className="rounded-2xl bg-zinc-800 p-4 text-zinc-400">
              Keine Clips gefunden.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredClips.map((clip) => (
                <div key={clip.id} className="rounded-2xl bg-zinc-800 p-4">
                  <div className="grid gap-4 md:grid-cols-[280px_1fr] md:items-start">
                    <div>
                      {clip.video_url ? (
                        <video
                          src={clip.video_url}
                          controls
                          className="w-full rounded-xl"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-xl bg-zinc-700 text-zinc-400">
                          Kein Video
                        </div>
                      )}
                    </div>

                    <div className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{clip.title}</p>
                        <p className="text-zinc-400">{clip.game}</p>
                        <p className="mt-2 text-sm text-zinc-500">
                          Likes: {clip.votes || 0}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLike(clip.id, clip.votes || 0)}
                          className="flex items-center gap-2 rounded-lg bg-pink-500 px-3 py-2 text-sm"
                        >
                          <Heart size={16} /> Liken
                        </button>

                        {currentUserId && clip.user_id === currentUserId && (
                          <button
                            onClick={() => handleDelete(clip.id)}
                            className="rounded-lg bg-red-500 px-3 py-2 text-sm"
                          >
                            Löschen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}