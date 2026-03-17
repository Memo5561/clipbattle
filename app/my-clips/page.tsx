"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { Heart, Trash2, User } from "lucide-react";

type Clip = {
  id: string;
  title: string;
  game: string;
  video_url?: string | null;
  votes?: number;
  user_id?: string | null;
};

export default function MyClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyClips = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCurrentUserId(null);
        setUserEmail(null);
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);
      setUserEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("clips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fehler beim Laden:", error.message);
        setLoading(false);
        return;
      }

      setClips(data || []);
      setLoading(false);
    };

    loadMyClips();
  }, []);

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
      prev.map((clip) =>
        clip.id === id ? { ...clip, votes: newVotes } : clip
      )
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

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          Lädt...
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">Nicht eingeloggt</h1>
          <p className="mb-6 text-zinc-400">
            Du musst eingeloggt sein, um deine eigenen Clips zu sehen.
          </p>

          <Link
            href="/auth"
            className="inline-block rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-2 flex items-center gap-2 text-zinc-400">
          <User size={18} />
          My Clips
        </div>
        <h1 className="text-4xl font-bold">Deine hochgeladenen Clips</h1>
        <p className="mt-3 text-zinc-400">
          Eingeloggt als <span className="font-semibold text-white">{userEmail}</span>
        </p>
      </div>

      {clips.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="mb-4 text-xl font-semibold">Du hast noch keine Clips hochgeladen.</p>
          <Link
            href="/upload"
            className="inline-block rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            Jetzt ersten Clip hochladen
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="grid gap-4 md:grid-cols-[320px_1fr] md:items-start">
                <div>
                  {clip.video_url ? (
                    <video
                      src={clip.video_url}
                      controls
                      className="w-full rounded-2xl"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
                      Kein Video
                    </div>
                  )}
                </div>

                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold">{clip.title}</p>
                    <p className="mt-1 text-zinc-400">{clip.game}</p>
                    <p className="mt-3 text-sm text-zinc-500">
                      Likes: {clip.votes || 0}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleLike(clip.id, clip.votes || 0)}
                      className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2"
                    >
                      <Heart size={16} />
                      Liken
                    </button>

                    <button
                      onClick={() => handleDelete(clip.id)}
                      className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2"
                    >
                      <Trash2 size={16} />
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}