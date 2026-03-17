"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Crown, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Clip = {
  id: string;
  title: string;
  game: string;
  video_url?: string | null;
  votes?: number;
};

export default function LeaderboardPage() {
  const [clips, setClips] = useState<Clip[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from("clips")
      .select("*")
      .order("votes", { ascending: false });

    if (error) {
      console.error("Fehler:", error.message);
      return;
    }

    if (data) {
      setClips(data);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Trophy /> Leaderboard
        </h1>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-black"
        >
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>

      {clips.length === 0 ? (
        <div className="rounded-3xl bg-zinc-900 p-8 text-center text-zinc-400">
          Noch keine Clips vorhanden.
        </div>
      ) : (
        <div className="space-y-4">
          {clips.map((clip, index) => (
            <div
              key={clip.id}
              className="flex items-center justify-between rounded-2xl bg-zinc-900 p-5"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-zinc-400">
                  #{index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {clip.title}
                    </p>

                    {index === 0 && (
                      <Crown className="text-yellow-400" size={18} />
                    )}
                  </div>

                  <p className="text-sm text-zinc-400">
                    {clip.game}
                  </p>
                </div>
              </div>

              <div className="text-lg font-bold text-white">
                {clip.votes || 0} ❤️
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}